import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
);

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
    throw new Error('Falta la variable GOOGLE_APPLICATION_CREDENTIALS.');
}

const credentialsFile = path.isAbsolute(credentialsPath)
    ? credentialsPath
    : path.resolve(backendDir, credentialsPath);

if (!fs.existsSync(credentialsFile)) {
    throw new Error(`No se encontró el archivo de credenciales: ${credentialsFile}`);
}

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

if (!spreadsheetId) {
    throw new Error('Falta la variable GOOGLE_SHEET_ID.');
}

const auth = new google.auth.GoogleAuth({
    keyFile: credentialsFile,
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