import { stripe } from '../models/stripe.model.js';
import {
    createAppointmentEvent,
    getAvailableSlots,
} from '../models/calendar.model.js';

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
        /^\d{2}:\d{2}$/.test(value)
    );
}

export async function getAvailability(req, res, next) {
    const { date } = req.query;

    if (!isValidDate(date)) {
        return res.status(400).json({
            message: 'Envía una fecha válida con el formato YYYY-MM-DD.',
        });
    }

    try {
        const slots = await getAvailableSlots(date);

        return res.json({
            date,
            timeZone:
                process.env.APPOINTMENT_TIMEZONE ||
                'America/Mexico_City',
            durationMinutes: Number(
                process.env.APPOINTMENT_DURATION_MINUTES || 180
            ),
            slots,
        });
    } catch (error) {
        return next(error);
    }
}

export async function createPaymentIntent(req, res, next) {
    const { appointmentDate, appointmentTime } = req.body || {};

    if (
        !isValidDate(appointmentDate) ||
        !isValidTime(appointmentTime)
    ) {
        return res.status(400).json({
            message: 'La fecha o el horario de la cita no son válidos.',
        });
    }

    try {
        // El servidor verifica la disponibilidad antes de crear el pago.
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

        const amount = Number(
            process.env.PRIORITY_APPOINTMENT_AMOUNT || 50000
        );
        const currency = (
            process.env.PRIORITY_APPOINTMENT_CURRENCY || 'mxn'
        ).toLowerCase();

        if (!Number.isInteger(amount) || amount < 1) {
            throw new Error(
                'PRIORITY_APPOINTMENT_AMOUNT debe ser un entero positivo.'
            );
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                appointmentDate,
                appointmentTime,
            },
        });

        return res.status(201).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        return next(error);
    }
}

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
        // Se comprueba el estado del pago consultando Stripe desde el backend.
        const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(409).json({
                message: 'Stripe aún no confirma el pago.',
            });
        }

        const { appointmentDate, appointmentTime } =
            paymentIntent.metadata || {};

        if (
            !isValidDate(appointmentDate) ||
            !isValidTime(appointmentTime)
        ) {
            return res.status(400).json({
                message:
                    'El pago no contiene una fecha y horario válidos.',
            });
        }

        const event = await createAppointmentEvent({
            date: appointmentDate,
            startTime: appointmentTime,
        });

        return res.status(201).json({
            message: 'Pago confirmado y cita agendada.',
            eventId: event.id,
        });
    } catch (error) {
        // Si el horario se ocupó durante el pago, intenta devolver el cobro.
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