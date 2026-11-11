import { useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './styles/PriorityAppointmentCheckout.scss';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ appointmentDate, amount, currency, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'Revisa los datos de pago e inténtalo de nuevo.');
            setProcessing(false);
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/cita/confirmacion`,
            },
            redirect: 'if_required',
        });

        if (result.error) {
            setError(result.error.message || 'No se pudo completar el pago.');
            setProcessing(false);
            return;
        }

        onSuccess?.({ paymentIntent: result.paymentIntent, appointmentDate });
        if (result.paymentIntent?.status === 'succeeded') {
            window.location.assign(
                `/cita/confirmacion?payment_intent=${encodeURIComponent(result.paymentIntent.id)}`
            );
        }
        setProcessing(false);
    };

    return (
        <form className="priority-checkout__form" onSubmit={handleSubmit}>
            <PaymentElement options={{ layout: 'tabs' }} />
            {error && <p className="priority-checkout__error" role="alert">{error}</p>}
            <button className="priority-checkout__pay" type="submit" disabled={!stripe || processing}>
                {processing ? 'PROCESANDO…' : `PAGAR ${new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount / 100)}`}
            </button>
            <p className="priority-checkout__secure">Pago seguro procesado por Stripe. Los datos de tu tarjeta no se guardan en este sitio.</p>
        </form>
    );
}

/**
 * Props:
 * createPaymentIntent({ appointmentDate }) must call your server and return
 * { clientSecret }. The server must validate the date/availability and calculate
 * the amount itself; never trust a price supplied by the browser.
 */
export default function PriorityAppointmentCheckout({
    createPaymentIntent,
    amount = 50000, // centavos MXN; presentation only, el servidor define el cobro real
    currency = 'MXN',
    minDate = new Date().toISOString().slice(0, 10),
    isDateAvailable = async () => true,
    onPaymentSuccess,
}) {
    const [date, setDate] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingDate, setCheckingDate] = useState(false);

    const formattedDate = useMemo(() => {
        if (!date) return '';
        return new Intl.DateTimeFormat('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
        }).format(new Date(`${date}T12:00:00Z`));
    }, [date]);

    const handleDateChange = async (event) => {
        const selected = event.target.value;
        setDate(selected);
        setClientSecret('');
        setError('');
        if (!selected) return;

        setCheckingDate(true);
        try {
            const available = await isDateAvailable(selected);
            if (!available) {
                setDate('');
                setError('Esa fecha ya no está disponible. Elige otra fecha.');
            }
        } catch {
            setDate('');
            setError('No pudimos verificar la disponibilidad. Inténtalo de nuevo.');
        } finally {
            setCheckingDate(false);
        }
    };

    const handleContinue = async () => {
        if (!date || !createPaymentIntent) return;
        setLoading(true);
        setError('');
        try {
            const response = await createPaymentIntent({ appointmentDate: date });
            if (!response?.clientSecret) throw new Error('El servidor no devolvió los datos de pago.');
            setClientSecret(response.clientSecret);
        } catch (err) {
            setError(err.message || 'No se pudo iniciar el pago. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="priority-checkout">
            <header className="priority-checkout__header">
                <a className="priority-checkout__back" href="/">← Volver</a>
                <span className="priority-checkout__eyebrow">ANTON GORBACH · BODY MODIFICATION</span>
                <h1>Agenda tu cita prioritaria</h1>
                <p>Elige la fecha que prefieres y completa tu pago de forma segura.</p>
            </header>

            <div className="priority-checkout__grid">
                <section className="priority-checkout__panel" aria-labelledby="appointment-date-title">
                    <span className="priority-checkout__step">PASO 1</span>
                    <h2 id="appointment-date-title">Selecciona la fecha</h2>
                    <label htmlFor="appointment-date">Fecha para tu cita</label>
                    <input
                        id="appointment-date"
                        className="priority-checkout__date"
                        type="date"
                        min={minDate}
                        value={date}
                        onChange={handleDateChange}
                        aria-describedby="date-help"
                    />
                    <small id="date-help">La disponibilidad se confirmará antes de iniciar el pago.</small>
                    {checkingDate && <p className="priority-checkout__notice">Verificando disponibilidad…</p>}
                    {date && !checkingDate && <p className="priority-checkout__selected">Fecha elegida: {formattedDate}</p>}
                    {error && !clientSecret && <p className="priority-checkout__error" role="alert">{error}</p>}
                    {!clientSecret && (
                        <button
                            className="priority-checkout__continue"
                            type="button"
                            disabled={!date || loading || checkingDate || !createPaymentIntent}
                            onClick={handleContinue}
                        >
                            {loading ? 'PREPARANDO PAGO…' : 'CONTINUAR AL PAGO'}
                        </button>
                    )}
                </section>

                <aside className="priority-checkout__summary" aria-label="Resumen de la cita">
                    <span className="priority-checkout__step">RESUMEN</span>
                    <h2>Prioridad de cita</h2>
                    <p>Solicitud de atención prioritaria</p>
                    <div className="priority-checkout__total">
                        <span>Total</span>
                        <strong>{new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount / 100)}</strong>
                    </div>
                    <small>La fecha queda sujeta a disponibilidad y confirmación.</small>
                </aside>
            </div>

            {clientSecret && (
                <section className="priority-checkout__payment" aria-labelledby="payment-title">
                    <span className="priority-checkout__step">PASO 2</span>
                    <h2 id="payment-title">Datos de pago</h2>
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#e94a78', colorBackground: '#160d18', colorText: '#fff4f8', borderRadius: '8px' } } }}>
                        <CheckoutForm
                            appointmentDate={date}
                            amount={amount}
                            currency={currency}
                            onSuccess={onPaymentSuccess}
                        />
                    </Elements>
                </section>
            )}
        </main>
    );
}
