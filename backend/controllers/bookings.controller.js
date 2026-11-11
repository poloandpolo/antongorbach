import { randomUUID } from 'node:crypto';
import { saveBooking } from '../models/booking.model.js';

export async function createBooking(req, res, next) {
    try {
        const { name, phone, email, coupon = '', description } = req.body;

        if (!name || !phone || !email || !description) {
            return res.status(400).json({
                message: 'Completa nombre, teléfono, email y descripción.',
            });
        }

        const booking = {
            id: randomUUID(),
            name: String(name).trim(),
            phone: String(phone).trim(),
            email: String(email).trim(),
            coupon: String(coupon).trim(),
            description: String(description).trim(),
        };

        await saveBooking(booking);

        return res.status(201).json({
            message: 'Solicitud guardada.',
            bookingId: booking.id,
        });
    } catch (error) {
        next(error);
    }
}