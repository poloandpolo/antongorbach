import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import './styles/PriorityAppointmentCheckout.scss';

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const CONTACT_STORAGE_KEY = 'priorityBookingContact';

function getPriorityContact() {
    try {
        const savedContact = sessionStorage.getItem(CONTACT_STORAGE_KEY);
        return savedContact ? JSON.parse(savedContact) : null;
    } catch {
        return null;
    }
}

function getTodayInMexicoCity() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

async function readResponse(response) {
    return response.json().catch(() => ({}));
}

function formatMoney(amountMinor, currency) {
    if (!Number.isFinite(amountMinor) || !currency) return '—';

    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amountMinor / 100);
}

function CheckoutForm({ amount, currency, contact }) {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [pendingPaymentIntentId, setPendingPaymentIntentId] =
        useState('');
    const [paymentBlocked, setPaymentBlocked] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (!showConfirmation) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showConfirmation]);

    const confirmAppointment = async paymentIntentId => {
        const response = await fetch(
            '/api/payments/confirm-appointment',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId,
                    bookingId: contact.bookingId,
                    name: contact.name,
                    phone: contact.phone,
                    email: contact.email || '',
                }),
            }
        );

        const data = await readResponse(response);

        if (!response.ok) {
            if (response.status === 409) {
                setPaymentBlocked(true);
            }

            throw new Error(
                data.message || 'No se pudo confirmar la cita.'
            );
        }

        return data;
    };

    const handleSubmit = async event => {
        event.preventDefault();

        if (!stripe || !elements || processing || paymentBlocked) return;

        setProcessing(true);
        setError('');

        let paymentIntentId = pendingPaymentIntentId;

        try {
            // Si Stripe ya aprobó el pago, permite reintentar la confirmación
            // de la cita sin volver a cobrar.
            if (!paymentIntentId) {
                const { error: submitError } = await elements.submit();

                if (submitError) {
                    throw new Error(
                        submitError.message ||
                            'Revisa los datos de pago e inténtalo de nuevo.'
                    );
                }

                const result = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/priority-appointment-checkout`,
                    },
                    redirect: 'if_required',
                });

                if (result.error) {
                    throw new Error(
                        result.error.message ||
                            'No se pudo completar el pago.'
                    );
                }

                if (result.paymentIntent?.status !== 'succeeded') {
                    throw new Error('Stripe aún no confirma el pago.');
                }

                paymentIntentId = result.paymentIntent.id;
                setPendingPaymentIntentId(paymentIntentId);
            }

            await confirmAppointment(paymentIntentId);

            try {
                sessionStorage.removeItem(CONTACT_STORAGE_KEY);
            } catch {
                // La cita ya se confirmó; no hace falta interrumpir el flujo.
            }

            setShowConfirmation(true);
        } catch (err) {
            setError(
                paymentIntentId && !paymentBlocked
                    ? `El pago fue aprobado, pero no se pudo confirmar la cita. Puedes reintentar la confirmación sin volver a pagar. ${err.message}`
                    : err.message || 'No se pudo procesar el pago.'
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <form
                className="priority-checkout__form"
                onSubmit={handleSubmit}
            >
                <PaymentElement options={{ layout: 'tabs' }} />

                {error && (
                    <p
                        className="priority-checkout__error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <button
                    className="priority-checkout__pay"
                    type="submit"
                    disabled={
                        !stripe ||
                        !elements ||
                        processing ||
                        paymentBlocked
                    }
                >
                    {processing
                        ? 'PROCESANDO…'
                        : pendingPaymentIntentId
                          ? 'REINTENTAR CONFIRMACIÓN'
                          : `PAGAR ${formatMoney(amount, currency)}`}
                </button>

                <p className="priority-checkout__secure">
                    Pago seguro procesado por Stripe. 
                </p>
            </form>

            {showConfirmation &&
                createPortal(
                    <div className="priority-checkout__success-overlay">
                        <section
                            className="priority-checkout__success-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="appointment-confirmation-title"
                        >
                            <span
                                className="priority-checkout__success-icon"
                                aria-hidden="true"
                            >
                                ✓
                            </span>

                            <h2 id="appointment-confirmation-title">
                                ¡Pago confirmado!
                            </h2>

                            <p>
                                Tu cita quedó agendada. En breve nos
                                pondremos en contacto contigo para confirmar
                                los detalles.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                            >
                                Entendido
                            </button>
                        </section>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default function PriorityAppointmentCheckout() {
    const [contact] = useState(getPriorityContact);

    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [checkingDate, setCheckingDate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [priceQuote, setPriceQuote] = useState(null);
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [priceError, setPriceError] = useState('');

    const availabilityRequest = useRef(null);
    const minDate = getTodayInMexicoCity();

    const selectedSlot = slots.find(
        slot => slot.start === selectedTime
    );

    const formattedDate = useMemo(() => {
        if (!date) return '';

        return new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(`${date}T12:00:00Z`));
    }, [date]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPrice() {
            setLoadingPrice(true);
            setPriceError('');

            try {
                const response = await fetch(
                    '/api/payments/priority-price',
                    { signal: controller.signal }
                );

                const data = await readResponse(response);

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            'No se pudo consultar el precio del anticipo.'
                    );
                }

                if (
                    !Number.isFinite(data.amountMinor) ||
                    !Number.isFinite(data.exchangeRate) ||
                    !Number.isFinite(data.usdAmount)
                ) {
                    throw new Error(
                        'El servidor devolvió una cotización incompleta.'
                    );
                }

                setPriceQuote(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setPriceError(
                        err.message ||
                            'No se pudo consultar el precio del anticipo.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingPrice(false);
                }
            }
        }

        loadPrice();

        return () => controller.abort();
    }, []);

    const handleDateChange = async event => {
        const selectedDate = event.target.value;

        availabilityRequest.current?.abort();

        setDate(selectedDate);
        setSlots([]);
        setSelectedTime('');
        setClientSecret('');
        setError('');

        if (!selectedDate) return;

        const controller = new AbortController();
        availabilityRequest.current = controller;
        setCheckingDate(true);

        try {
            const response = await fetch(
                `/api/appointments/availability?date=${encodeURIComponent(
                    selectedDate
                )}`,
                { signal: controller.signal }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        'No se pudo consultar la disponibilidad.'
                );
            }

            const availableSlots = Array.isArray(data.slots)
                ? data.slots
                : [];

            setSlots(availableSlots);

            if (availableSlots.length === 0) {
                setError(
                    'No hay horarios disponibles para esa fecha. Elige otro día.'
                );
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setSlots([]);
                setError(
                    err.message ||
                        'No se pudo consultar la disponibilidad.'
                );
            }
        } finally {
            if (!controller.signal.aborted) {
                setCheckingDate(false);
            }
        }
    };

    const handleContinue = async () => {
        if (!date || !selectedTime || loading) return;

        if (!contact?.bookingId || !contact?.name || !contact?.phone) {
            setError(
                'No encontramos tus datos de contacto. Regresa al formulario y envíalo de nuevo.'
            );
            return;
        }

        if (!priceQuote) {
            setError(
                'No tenemos una cotización disponible. Recarga la página e inténtalo de nuevo.'
            );
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                '/api/payments/create-payment-intent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        appointmentDate: date,
                        appointmentTime: selectedTime,
                        bookingId: contact.bookingId,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'No se pudo iniciar el pago.'
                );
            }

            if (
                !data.clientSecret ||
                !Number.isFinite(data.amount) ||
                !data.currency
            ) {
                throw new Error(
                    'El servidor no devolvió los datos completos del pago.'
                );
            }

            // Usa el importe confirmado por el backend al crear el PaymentIntent.
            setPriceQuote(previous => ({
                ...previous,
                ...data,
                amountMinor: data.amount,
                amountMxn: data.amountMxn,
            }));

            setClientSecret(data.clientSecret);
        } catch (err) {
            setError(
                err.message ||
                    'No se pudo iniciar el pago. Inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    const displayCurrency = priceQuote?.currency || 'mxn';

    return (
        <main className="priority-checkout">
            <header className="priority-checkout__header">
                <a className="priority-checkout__back" href="/">
                    ← Volver
                </a>

                <span className="priority-checkout__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Agenda tu cita prioritaria</h1>
                <p>
                    Elige una fecha y un horario disponible para tu cita.
                </p>
            </header>

            <div className="priority-checkout__grid">
                <section
                    className="priority-checkout__panel"
                    aria-labelledby="appointment-date-title"
                >
                    <span className="priority-checkout__step">PASO 1</span>

                    <h2 id="appointment-date-title">
                        Selecciona fecha y horario
                    </h2>

                    <label htmlFor="appointment-date">
                        Fecha para tu cita
                    </label>

                    <input
                        id="appointment-date"
                        className="priority-checkout__date"
                        type="date"
                        min={minDate}
                        value={date}
                        onChange={handleDateChange}
                        disabled={loading || Boolean(clientSecret)}
                    />

                    {checkingDate && (
                        <p className="priority-checkout__notice">
                            Consultando horarios disponibles…
                        </p>
                    )}

                    {date && !checkingDate && slots.length > 0 && (
                        <>
                            <label htmlFor="appointment-time">
                                Horario disponible
                            </label>

                            <select
                                id="appointment-time"
                                className="priority-checkout__time"
                                value={selectedTime}
                                onChange={event => {
                                    setSelectedTime(event.target.value);
                                    setError('');
                                    setClientSecret('');
                                }}
                                disabled={loading || Boolean(clientSecret)}
                            >
                                <option value="">
                                    Selecciona un horario
                                </option>

                                {slots.map(slot => (
                                    <option
                                        key={slot.start}
                                        value={slot.start}
                                    >
                                        {slot.start} – {slot.end}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    {selectedSlot && (
                        <p className="priority-checkout__selected">
                            Cita seleccionada: {formattedDate}, de{' '}
                            {selectedSlot.start} a {selectedSlot.end}
                        </p>
                    )}

                    {error && !clientSecret && (
                        <p
                            className="priority-checkout__error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {!clientSecret && (
                        <button
                            className="priority-checkout__continue"
                            type="button"
                            disabled={
                                !date ||
                                !selectedTime ||
                                checkingDate ||
                                loading ||
                                loadingPrice ||
                                !priceQuote
                            }
                            onClick={handleContinue}
                        >
                            {loading
                                ? 'PREPARANDO PAGO…'
                                : 'CONTINUAR AL PAGO'}
                        </button>
                    )}
                </section>

                <aside
                    className="priority-checkout__summary"
                    aria-label="Resumen de la cita"
                >
                    <span className="priority-checkout__step">
                        RESUMEN
                    </span>

                    <h2>Prioridad de cita</h2>
                    <p>Solicitud de atención prioritaria</p>

                    {selectedSlot && (
                        <p>
                            {formattedDate}
                            <br />
                            {selectedSlot.start} – {selectedSlot.end}
                        </p>
                    )}

                    <div className="priority-checkout__total">
                        <span>Anticipo</span>
                        <strong>
                            {loadingPrice
                                ? 'Consultando…'
                                : priceQuote
                                  ? formatMoney(
                                        priceQuote.amountMinor,
                                        displayCurrency
                                    )
                                  : 'No disponible'}
                        </strong>
                    </div>

                    {priceQuote && (
                        <>
                            <p>
                                Equivalente a{' '}
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(priceQuote.usdAmount)}{' '}
                                USD
                            </p>

                            <small>
                                Tipo de cambio de referencia: 1 USD ={' '}
                                {Number(priceQuote.exchangeRate).toFixed(4)}{' '}
                                MXN
                                {priceQuote.rateDate
                                    ? ` · ${priceQuote.rateDate}`
                                    : ''}
                            </small>
                        </>
                    )}

                    {priceError && (
                        <p
                            className="priority-checkout__error"
                            role="alert"
                        >
                            {priceError}
                        </p>
                    )}

                    
                </aside>
            </div>

            {clientSecret && priceQuote && (
                <section
                    className="priority-checkout__payment"
                    aria-labelledby="payment-title"
                >
                    <span className="priority-checkout__step">PASO 2</span>
                    <h2 id="payment-title">Datos de pago</h2>

                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: 'night',
                                variables: {
                                    colorPrimary: '#e94a78',
                                    colorBackground: '#160d18',
                                    colorText: '#fff4f8',
                                    borderRadius: '8px',
                                },
                            },
                        }}
                    >
                        <CheckoutForm
                            amount={priceQuote.amountMinor}
                            currency={priceQuote.currency}
                            contact={contact}
                        />
                    </Elements>
                </section>
            )}
        </main>
    );
}