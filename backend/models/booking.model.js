import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
);

const envResult = dotenv.config({
    path: path.join(backendDir, '.env'),
});

if (envResult.error) {
    throw new Error(
        `No se pudo leer backend/.env: ${envResult.error.message}`
    );
}

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
    throw new Error(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en backend/.env'
    );
}

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

if (!spreadsheetId) {
    throw new Error('Falta GOOGLE_SHEET_ID en backend/.env');
}

const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(backendDir, credentialsPath),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function saveBooking(booking) {
    const sheets = google.sheets({
        version: 'v4',
        auth,
    });

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: process.env.GOOGLE_SHEET_RANGE || 'Solicitudes!A:H',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [[
                new Date().toISOString(),
                booking.id,
                booking.name,
                booking.phone,
                booking.email,
                booking.coupon || '',
                booking.description,
                'Solicitud recibida',
            ]],
        },
    });
}