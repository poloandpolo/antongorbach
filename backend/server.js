import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.join(backendDir, '.env'),
});

const { default: app } = await import('./app.js');

const port = process.env.PORT || 3001;

app.listen(port, '0.0.0.0', () => {
    console.log(`Backend escuchando en puerto ${port}`);
});