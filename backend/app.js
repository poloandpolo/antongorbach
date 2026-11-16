import express from 'express';
import bookingsRoutes from './routes/booking.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/bookings', bookingsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/payments', paymentsRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

app.use((error, _req, res, _next) => {
    console.error(error);

    const status = error.status || 500;

    res.status(status).json({
        message:
            process.env.NODE_ENV === 'production'
                ? 'Error interno del servidor.'
                : error.message,
    });
});

export default app;