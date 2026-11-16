import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
);

function getSheetsConfig() {
    const credentialsPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const spreadsheetId =
        process.env.GOOGLE_PRIORITY_SHEET_ID;
    const range =
        process.env.GOOGLE_PRIORITY_SHEET_RANGE ||
        "'Citas prioritarias'!A:I";

    if (!credentialsPath) {
        throw new Error(
            'Falta GOOGLE_APPLICATION_CREDENTIALS en backend/.env.'
        );
    }

    if (!spreadsheetId) {
        throw new Error(
            'Falta GOOGLE_PRIORITY_SHEET_ID en backend/.env.'
        );
    }

    return {
        credentialsPath: path.resolve(backendDir, credentialsPath),
        spreadsheetId,
        range,
    };
}

async function getSheetsClient() {
    const { credentialsPath } = getSheetsConfig();

    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    return google.sheets({
        version: 'v4',
        auth,
    });
}

export async function savePriorityAppointment(appointment) {
    const {
        credentialsPath: _credentialsPath,
        spreadsheetId,
        range,
    } = getSheetsConfig();

    const sheets = await getSheetsClient();

    // La columna I guarda el ID de Stripe y sirve para evitar filas duplicadas.
    const tabName = range.split('!')[0];
    const paymentIdsRange = `${tabName}!I:I`;

    const existingPayments = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: paymentIdsRange,
    });

    const paymentIntentIds = (
        existingPayments.data.values || []
    ).flat();

    if (paymentIntentIds.includes(appointment.paymentIntentId)) {
        return { alreadySaved: true };
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [[
                new Date().toISOString(),
                appointment.bookingId,
                appointment.name,
                appointment.phone,
                appointment.email,
                appointment.appointmentDate,
                appointment.appointmentTime,
                appointment.eventId,
                appointment.paymentIntentId,
            ]],
        },
    });

    return { alreadySaved: false };
}