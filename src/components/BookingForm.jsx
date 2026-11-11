import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookingForm.scss';
import PriorityBookingModal from './PriorityBookingModal';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const BookingForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        description: '',
        coupon: '',
    });

    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookingId, setBookingId] = useState('');

    const handleChange = event => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            if (!API_BASE_URL) {
                throw new Error(
                    'Falta configurar VITE_API_URL en Vercel.'
                );
            }

            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                coupon: formData.coupon.trim(),
                description: formData.description.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type');
            const result = contentType?.includes('application/json')
                ? await response.json()
                : {};

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        `No se pudo guardar la solicitud (error ${response.status}).`
                );
            }

            if (!result.bookingId) {
                throw new Error(
                    'El servidor no devolvió el ID de la solicitud.'
                );
            }

            setBookingId(result.bookingId);
            setShowPriorityModal(true);
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            setSubmitError(
                error.message || 'No se pudo conectar con el servidor.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePriorityPayment = () => {
        setShowPriorityModal(false);

        navigate('/priority-appointment-checkout', {
            state: { bookingId },
        });
    };

    const closePriorityModal = () => {
        setShowPriorityModal(false);
    };

    return (
        <>
            <section className="booking-form" id="booking">
                <div className="booking-form__container">
                    <header className="booking-form__header">
                        <h1 data-text="Agenda tu cita">
                            Agenda tu cita
                        </h1>

                        <p>
                            Dile a Anton tu visión, agrega una referencia
                            si la tienes.
                        </p>
                    </header>

                    <form
                        className="booking-form__form"
                        data-booking-form
                        onSubmit={handleSubmit}
                    >
                        <div className="booking-form__field">
                            <label htmlFor="name">Nombre</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="booking-form__field">
                            <label htmlFor="phone">
                                Número de teléfono
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="booking-form__field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="booking-form__field booking-form__field--coupon">
                            <label htmlFor="coupon">
                                Código de cupón (opcional)
                            </label>
                            <input
                                id="coupon"
                                name="coupon"
                                type="text"
                                value={formData.coupon}
                                onChange={handleChange}
                                placeholder="Ej. EYEBALL60"
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <span className="booking-form__file-text">
                                ¿Tienes un cupón de descuento? Escríbelo aquí.
                            </span>
                        </div>

                        <div className="booking-form__field">
                            <label htmlFor="description">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="5"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Cuéntale a Anton qué tienes en mente..."
                                required
                            />
                        </div>

                        {submitError && (
                            <p
                                className="booking-form__error"
                                role="alert"
                            >
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="booking-form__submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Enviando solicitud…'
                                : 'Enviar solicitud'}
                        </button>
                    </form>
                </div>
            </section>

            <PriorityBookingModal
                isOpen={showPriorityModal}
                onClose={closePriorityModal}
                onContinue={handlePriorityPayment}
            />
        </>
    );
};

export default BookingForm;