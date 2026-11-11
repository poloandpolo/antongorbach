import express from 'express';
import bookingsRoutes from './routes/booking.routes.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/bookings', bookingsRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

app.use((error, _req, res, _next) => {
    console.error(error);

    res.status(500).json({
        message:
            process.env.NODE_ENV === 'production'
                ? 'Error interno del servidor.'
                : error.message,
    });
});

export default app;