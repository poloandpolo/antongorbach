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
        "'Citas prioritarias'!A:M";

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

    const separatorIndex = range.lastIndexOf('!');

    if (separatorIndex === -1) {
        throw new Error(
            'GOOGLE_PRIORITY_SHEET_RANGE debe incluir el nombre de la pestaña y el rango, por ejemplo: \'Citas prioritarias\'!A:M'
        );
    }

    const sheetName = range.slice(0, separatorIndex);
    const appendRange = range.slice(separatorIndex + 1);

    return {
        credentialsPath: path.isAbsolute(credentialsPath)
            ? credentialsPath
            : path.resolve(backendDir, credentialsPath),
        spreadsheetId,
        sheetName,
        appendRange,
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

function numberOrBlank(value) {
    if (value === '' || value === null || value === undefined) {
        return '';
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : '';
}

export async function savePriorityAppointment(appointment) {
    if (!appointment?.paymentIntentId) {
        throw new Error(
            'Falta paymentIntentId al guardar el pago prioritario.'
        );
    }

    const {
        spreadsheetId,
        sheetName,
        appendRange,
        range,
    } = getSheetsConfig();

    const sheets = await getSheetsClient();

    // La columna I contiene el PaymentIntent ID.
    // Se empieza en la fila 2 para no leer el encabezado.
    const paymentIdsRange = `${sheetName}!I2:I`;

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
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [[
                new Date().toISOString(),              // A: Fecha de pago
                appointment.bookingId || '',           // B: ID de solicitud
                appointment.name || '',                // C: Nombre
                appointment.phone || '',               // D: Teléfono
                appointment.email || '',               // E: Correo
                appointment.appointmentDate || '',     // F: Fecha de cita
                appointment.appointmentTime || '',     // G: Hora de cita
                appointment.eventId || '',             // H: ID del evento
                appointment.paymentIntentId,           // I: ID de Stripe
                numberOrBlank(appointment.usdAmount),  // J: Importe USD
                numberOrBlank(appointment.mxnAmount),  // K: Cargo MXN
                numberOrBlank(appointment.exchangeRate), // L: Tipo de cambio
                appointment.exchangeRateDate || '',    // M: Fecha del tipo de cambio
            ]],
        },
    });

    return { alreadySaved: false };
}