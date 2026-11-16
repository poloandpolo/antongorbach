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

// GET /api/payments/priority-price
// El frontend usa esta cotización para mostrar el precio convertido.
export async function getPriorityPrice(req, res, next) {
    try {
        const quote = await getPriorityPriceQuote();
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
    } = req.body || {};

    if (
        !isValidDate(appointmentDate) ||
        !isValidTime(appointmentTime)
    ) {
        return res.status(400).json({
            message: 'La fecha o el horario de la cita no son válidos.',
        });
    }

    if (!isValidText(bookingId, 200)) {
        return res.status(400).json({
            message: 'Falta el ID de la solicitud.',
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

        // El importe se calcula en el backend, nunca se recibe del navegador.
        const quote = await getPriorityPriceQuote();

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

        const paymentIntent = await stripe.paymentIntents.create({
            amount: quote.amountMinor,
            currency: quote.currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: bookingId.trim(),
                appointmentDate,
                appointmentTime,
                usdAmount: Number(quote.usdAmount).toFixed(2),
                exchangeRate: String(quote.exchangeRate),
                exchangeRateDate: String(quote.rateDate),
                mxnAmount: Number(quote.amountMxn).toFixed(2),
            },
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
    const {
        paymentIntentId,
        bookingId,
        name,
        phone,
        email = '',
    } = req.body || {};

    if (
        typeof paymentIntentId !== 'string' ||
        !paymentIntentId.startsWith('pi_')
    ) {
        return res.status(400).json({
            message: 'El ID del pago no es válido.',
        });
    }

    if (
        !isValidText(bookingId, 200) ||
        !isValidText(name, 200) ||
        !isValidText(phone, 50) ||
        typeof email !== 'string' ||
        email.length > 200
    ) {
        return res.status(400).json({
            message: 'Faltan datos de contacto válidos para la cita.',
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
        const {
            bookingId: paymentBookingId,
            appointmentDate,
            appointmentTime,
            appointmentEventId,
        } = metadata;

        if (
            !isValidDate(appointmentDate) ||
            !isValidTime(appointmentTime)
        ) {
            return res.status(400).json({
                message:
                    'El pago no contiene una fecha y horario válidos.',
            });
        }

        if (paymentBookingId !== bookingId.trim()) {
            return res.status(400).json({
                message:
                    'La solicitud no coincide con la información del pago.',
            });
        }

        let eventId = appointmentEventId;

        // Si todavía no existe evento, agenda la cita y guarda su ID
        // en Stripe para que un reintento no cree otro evento.
        if (!eventId) {
            const event = await createAppointmentEvent({
                date: appointmentDate,
                startTime: appointmentTime,
                bookingId: bookingId.trim(),
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
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
            bookingId: bookingId.trim(),
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
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