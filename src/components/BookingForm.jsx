import { useState, useEffect } from 'react';
import './styles/BookingForm.scss';

const COUPON_TO_USE_KEY = 'couponToUse';

const getSavedCoupon = () => {
    try {
        return (
            localStorage.getItem(COUPON_TO_USE_KEY) ||
            sessionStorage.getItem(COUPON_TO_USE_KEY) ||
            ''
        );
    } catch {
        return '';
    }
};

const BookingForm = ({ initialCoupon = '' }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        description: '',
        reference: null,
        coupon: initialCoupon || getSavedCoupon(),
    });

    // Sincronizar cuando cambie initialCoupon o se monte el formulario.
    useEffect(() => {
        const savedCoupon = initialCoupon || getSavedCoupon();

        if (savedCoupon) {
            setFormData((prev) => ({
                ...prev,
                coupon: savedCoupon,
            }));
        }
    }, [initialCoupon]);

    // Escuchar los cupones seleccionados desde CouponListModal.
    useEffect(() => {
        const handleApplyCoupon = (event) => {
            const couponCode =
                typeof event.detail === 'string'
                    ? event.detail
                    : event.detail?.code;

            if (!couponCode) return;

            setFormData((prev) => ({
                ...prev,
                coupon: couponCode,
            }));
        };

        window.addEventListener('apply-coupon', handleApplyCoupon);

        // Comprobar otra vez por si se seleccionó el cupón
        // antes de que este formulario se montara.
        const savedCoupon = getSavedCoupon();

        if (savedCoupon) {
            setFormData((prev) => ({
                ...prev,
                coupon: savedCoupon,
            }));
        }

        return () => {
            window.removeEventListener(
                'apply-coupon',
                handleApplyCoupon
            );
        };
    }, []);

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log(formData);

        // Posteriormente conectaremos el formulario
        // con tu backend / API / WhatsApp.
    };

    return (
        <section className="booking-form" id="booking">
            <div className="booking-form__container">
                <header className="booking-form__header">
                    <h1 data-text="Agenda tu cita">
                        Agenda tu cita
                    </h1>

                    <p>
                        Dile a Anton tu visión, agrega una referencia si la tienes
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

                    <div className="booking-form__field booking-form__field--file">
                        <label htmlFor="reference">
                            Imagen de referencia
                        </label>

                        <input
                            id="reference"
                            name="reference"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                        />

                        <span className="booking-form__file-text">
                            JPG, PNG, WEBP
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

                    <button
                        type="submit"
                        className="booking-form__submit"
                    >
                        Enviar solicitud
                    </button>
                </form>
            </div>
        </section>
    );
};

export default BookingForm;