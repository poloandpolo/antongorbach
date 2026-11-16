import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const backendDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
);

const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const timeZone =
    process.env.APPOINTMENT_TIMEZONE || 'America/Mexico_City';
const startHour = Number(
    process.env.APPOINTMENT_START_HOUR || 9
);
const endHour = Number(
    process.env.APPOINTMENT_END_HOUR || 19
);
const durationMinutes = Number(
    process.env.APPOINTMENT_DURATION_MINUTES || 180
);

if (!credentialsPath) {
    throw new Error(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en el entorno del backend.'
    );
}

if (!calendarId) {
    throw new Error(
        'Falta GOOGLE_CALENDAR_ID en el entorno del backend.'
    );
}

if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    startHour < 0 ||
    endHour > 24 ||
    startHour >= endHour ||
    durationMinutes > (endHour - startHour) * 60
) {
    throw new Error(
        'La configuración del horario de citas no es válida.'
    );
}

const keyFile = path.isAbsolute(credentialsPath)
    ? credentialsPath
    : path.resolve(backendDir, credentialsPath);

const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: [
        'https://www.googleapis.com/auth/calendar.freebusy',
        'https://www.googleapis.com/auth/calendar.events',
    ],
});

const calendar = google.calendar({
    version: 'v3',
    auth,
});

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

// Convierte una hora local de la zona configurada a un instante UTC.
function localTimeToDate(date, hour, minute = 0) {
    const [year, month, day] = date.split('-').map(Number);
    const targetAsUtc = Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute
    );

    let utcMilliseconds = targetAsUtc;

    for (let attempt = 0; attempt < 4; attempt += 1) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date(utcMilliseconds));

        const values = Object.fromEntries(
            parts
                .filter(part => part.type !== 'literal')
                .map(part => [part.type, Number(part.value)])
        );

        const representedAsUtc = Date.UTC(
            values.year,
            values.month - 1,
            values.day,
            values.hour,
            values.minute,
            values.second
        );

        const difference = targetAsUtc - representedAsUtc;
        utcMilliseconds += difference;

        if (difference === 0) break;
    }

    return new Date(utcMilliseconds);
}

async function getBusyPeriods(dayStart, dayEnd) {
    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: dayStart.toISOString(),
            timeMax: dayEnd.toISOString(),
            timeZone,
            items: [{ id: calendarId }],
        },
    });

    const calendarData = response.data.calendars?.[calendarId];

    if (calendarData?.errors?.length) {
        throw new Error(
            `Google Calendar no pudo consultar el calendario: ${calendarData.errors[0].reason}`
        );
    }

    return calendarData?.busy || [];
}

async function findEventByBookingId(bookingId) {
    if (!bookingId) return null;

    const response = await calendar.events.list({
        calendarId,
        privateExtendedProperty: `bookingId=${bookingId}`,
        maxResults: 1,
        singleEvents: true,
    });

    return response.data.items?.[0] || null;
}

export async function getAvailableSlots(date) {
    if (!isValidDate(date)) {
        throw new Error(
            'La fecha debe tener el formato válido YYYY-MM-DD.'
        );
    }

    const dayStart = localTimeToDate(date, startHour);
    const dayEnd = localTimeToDate(date, endHour);
    const busyPeriods = await getBusyPeriods(dayStart, dayEnd);
    const durationMilliseconds = durationMinutes * 60 * 1000;
    const slots = [];

    const startOfBusinessDay = startHour * 60;
    const endOfBusinessDay = endHour * 60;

    for (
        let startMinutes = startOfBusinessDay;
        startMinutes + durationMinutes <= endOfBusinessDay;
        startMinutes += durationMinutes
    ) {
        const startHourLocal = Math.floor(startMinutes / 60);
        const startMinuteLocal = startMinutes % 60;

        const start = localTimeToDate(
            date,
            startHourLocal,
            startMinuteLocal
        );
        const end = new Date(
            start.getTime() + durationMilliseconds
        );

        if (start <= new Date()) continue;

        const conflicts = busyPeriods.some(period => {
            const busyStart = new Date(period.start);
            const busyEnd = new Date(period.end);

            return start < busyEnd && end > busyStart;
        });

        if (!conflicts) {
            slots.push({
                start: `${String(startHourLocal).padStart(2, '0')}:${String(
                    startMinuteLocal
                ).padStart(2, '0')}`,
                end: new Intl.DateTimeFormat('en-GB', {
                    timeZone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23',
                }).format(end),
                startDateTime: start.toISOString(),
                endDateTime: end.toISOString(),
            });
        }
    }

    return slots;
}

export async function createAppointmentEvent({
    date,
    startTime,
    bookingId,
    name,
    email,
    phone,
}) {
    if (!isValidDate(date)) {
        throw new Error('La fecha de la cita no es válida.');
    }

    if (
        typeof startTime !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
    ) {
        throw new Error('El horario de la cita no es válido.');
    }

    // En un reintento, devuelve el evento ya creado para esta solicitud.
    if (bookingId) {
        const existingEvent = await findEventByBookingId(bookingId);

        if (existingEvent) {
            return existingEvent;
        }
    }

    const availableSlots = await getAvailableSlots(date);
    const selectedSlot = availableSlots.find(
        slot => slot.start === startTime
    );

    if (!selectedSlot) {
        const error = new Error(
            'El horario seleccionado ya no está disponible.'
        );
        error.status = 409;
        throw error;
    }

    const description = [
        'Cita prioritaria',
        bookingId ? `ID de solicitud: ${bookingId}` : null,
        name ? `Nombre: ${name}` : null,
        email ? `Correo: ${email}` : null,
        phone ? `Teléfono: ${phone}` : null,
    ]
        .filter(Boolean)
        .join('\n');

    const response = await calendar.events.insert({
        calendarId,
        sendUpdates: 'none',
        requestBody: {
            summary: `Cita prioritaria${name ? ` - ${name}` : ''}`,
            description,
            start: {
                dateTime: selectedSlot.startDateTime,
                timeZone,
            },
            end: {
                dateTime: selectedSlot.endDateTime,
                timeZone,
            },
            ...(bookingId
                ? {
                      extendedProperties: {
                          private: {
                              bookingId,
                          },
                      },
                  }
                : {}),
        },
    });

    return response.data;
}