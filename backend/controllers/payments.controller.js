import { stripe } from '../models/stripe.model.js';
import {
    createAppointmentEvent,
    getAvailableSlots,
} from '../models/calendar.model.js';
import {
    savePriorityAppointment,
} from '../models/priority-appointments.model.js';
import {
    getPriorityPrice as getPriorityPriceQuote,
} from '../models/exchange-rate.model.js';

function isValidDate(value) {
    if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
    return (
        typeof value === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    );
}

function isValidText(value, maxLength = 200) {
    return (
        typeof value === 'string' &&
        value.trim().length > 0 &&
        value.trim().length <= maxLength
    );
}

function getOptionalText(value, maxLength) {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    if (typeof value !== 'string' || value.trim().length > maxLength) {
        return null;
    }

    return value.trim();
}

// GET /api/payments/priority-price?amountUsd=85.50
export async function getPriorityPrice(req, res, next) {
    try {
        const quote = await getPriorityPriceQuote(
            req.query.amountUsd
        );

        return res.json(quote);
    } catch (error) {
        return next(error);
    }
}

// POST /api/payments/create-payment-intent
export async function createPaymentIntent(req, res, next) {
    const {
        appointmentDate,
        appointmentTime,
        bookingId,
        name,
        phone,
        email,
        amountUsd,
    } = req.body || {};

    if (
        !isValidDate(appointmentDate) ||
        !isValidTime(appointmentTime)
    ) {
        return res.status(400).json({
            message: 'La fecha o el horario de la cita no son válidos.',
        });
    }

    if (!isValidText(name, 200)) {
        return res.status(400).json({
            message: 'Falta un nombre válido para el pago.',
        });
    }

    const normalizedBookingId =
        typeof bookingId === 'string' ? bookingId.trim() : '';

    if (bookingId != null && typeof bookingId !== 'string') {
        return res.status(400).json({
            message: 'El ID de la solicitud no es válido.',
        });
    }

    const normalizedPhone = getOptionalText(phone, 50);
    const normalizedEmail = getOptionalText(email, 200);

    if (normalizedPhone === null || normalizedEmail === null) {
        return res.status(400).json({
            message: 'El teléfono o correo no son válidos.',
        });
    }

    try {
        const slots = await getAvailableSlots(appointmentDate);
        const slotIsAvailable = slots.some(
            slot => slot.start === appointmentTime
        );

        if (!slotIsAvailable) {
            return res.status(409).json({
                message:
                    'Ese horario ya no está disponible. Elige otro.',
            });
        }

        // El backend calcula el equivalente en MXN.
        // Si no llega amountUsd, el modelo usa el importe predeterminado.
        const quote = await getPriorityPriceQuote(amountUsd);

        if (
            !Number.isInteger(quote.amountMinor) ||
            quote.amountMinor < 1 ||
            !Number.isFinite(quote.exchangeRate) ||
            quote.exchangeRate <= 0
        ) {
            throw new Error(
                'La cotización USD/MXN recibida no es válida.'
            );
        }

        const metadata = {
            customerName: name.trim(),
            customerPhone: normalizedPhone,
            customerEmail: normalizedEmail,
            appointmentDate,
            appointmentTime,
            usdAmount: Number(quote.usdAmount).toFixed(2),
            exchangeRate: String(quote.exchangeRate),
            exchangeRateDate: String(quote.rateDate || ''),
            mxnAmount: Number(quote.amountMxn).toFixed(2),
        };

        if (normalizedBookingId) {
            metadata.bookingId = normalizedBookingId;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: quote.amountMinor,
            currency: quote.currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata,
        });

        return res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            amount: quote.amountMinor,
            amountMxn: quote.amountMxn,
            currency: quote.currency,
            usdAmount: quote.usdAmount,
            exchangeRate: quote.exchangeRate,
            rateDate: quote.rateDate,
        });
    } catch (error) {
        return next(error);
    }
}

// POST /api/payments/confirm-appointment
export async function confirmAppointmentPayment(req, res, next) {
    const { paymentIntentId } = req.body || {};

    if (
        typeof paymentIntentId !== 'string' ||
        !paymentIntentId.startsWith('pi_')
    ) {
        return res.status(400).json({
            message: 'El ID del pago no es válido.',
        });
    }

    try {
        const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(409).json({
                message: 'Stripe aún no confirma el pago.',
            });
        }

        const metadata = paymentIntent.metadata || {};

        const appointmentDate = metadata.appointmentDate;
        const appointmentTime = metadata.appointmentTime;
        const bookingId = metadata.bookingId || '';
        const name = metadata.customerName || '';
        const phone = metadata.customerPhone || '';
        const email = metadata.customerEmail || '';

        if (
            !isValidDate(appointmentDate) ||
            !isValidTime(appointmentTime) ||
            !isValidText(name, 200)
        ) {
            return res.status(400).json({
                message:
                    'El pago no contiene un nombre, fecha y horario válidos.',
            });
        }

        // Si no hay bookingId, usa el ID de Stripe como referencia del evento,
        // para que un reintento no cree una segunda cita.
        const eventReference = bookingId || paymentIntentId;
        let eventId = metadata.appointmentEventId;

        if (!eventId) {
            const event = await createAppointmentEvent({
                date: appointmentDate,
                startTime: appointmentTime,
                bookingId: eventReference,
                name,
                phone,
                email,
            });

            eventId = event.id;

            await stripe.paymentIntents.update(paymentIntentId, {
                metadata: {
                    ...metadata,
                    appointmentEventId: eventId,
                },
            });
        }

        await savePriorityAppointment({
            paymentIntentId,
            bookingId,
            name,
            phone,
            email,
            appointmentDate,
            appointmentTime,
            eventId,
            usdAmount: metadata.usdAmount || '',
            exchangeRate: metadata.exchangeRate || '',
            exchangeRateDate: metadata.exchangeRateDate || '',
            mxnAmount: metadata.mxnAmount || '',
        });

        return res.status(200).json({
            message: 'Pago confirmado y cita agendada.',
            eventId,
        });
    } catch (error) {
        if (error.status === 409) {
            try {
                await stripe.refunds.create({
                    payment_intent: paymentIntentId,
                });

                return res.status(409).json({
                    message:
                        'El horario dejó de estar disponible. Se inició la devolución del pago.',
                });
            } catch (refundError) {
                return next(refundError);
            }
        }

        return next(error);
    }
}