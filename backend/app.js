import express from 'express';
import cors from 'cors';
import bookingsRoutes from './routes/booking.routes.js';

const app = express();

const allowedOrigins = (
    process.env.FRONTEND_ORIGINS ||
    process.env.FRONTEND_ORIGIN ||
    ''
)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// CORS debe ir antes del JSON parser y de las rutas para responder el preflight.
app.use(cors({
    origin(origin, callback) {
        // Permite llamadas sin Origin, como algunas solicitudes servidor a servidor.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origen CORS no permitido: ${origin}`));
    },
}));

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