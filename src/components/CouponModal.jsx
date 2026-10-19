
import { useEffect, useState } from 'react';

import './styles/CouponModal.scss';

const COUPON_TO_USE_KEY = 'couponToUse';

const CouponModal = ({
    procedure,
    discount,
    image,
    code,
    expiresAt,
    validityMonths,
    delay = 30000,
    storageKey,
    onClose,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Mostrar el cupón una sola vez, incluso después de cerrar el navegador.
    useEffect(() => {
        if (
            !procedure ||
            discount == null ||
            !code ||
            !storageKey
        ) {
            return;
        }

        if (localStorage.getItem(storageKey)) {
            return;
        }

        const timer = window.setTimeout(() => {
            // Comprobar nuevamente antes de mostrarlo.
            if (localStorage.getItem(storageKey)) {
                return;
            }

            localStorage.setItem(storageKey, 'true');
            setIsOpen(true);
        }, Math.max(0, delay));

        return () => window.clearTimeout(timer);
    }, [procedure, discount, code, delay, storageKey]);

    // Bloquear el scroll de fondo mientras el modal está abierto.
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // Cerrar el modal con Escape.
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = event => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                onClose?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const getExpirationDate = () => {
        if (expiresAt) {
            const date = new Date(expiresAt);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
            }
        }

        if (validityMonths) {
            const date = new Date();

            date.setMonth(date.getMonth() + validityMonths);

            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        }

        return null;
    };

    const expirationDate = getExpirationDate();

    const findBookingForm = () => {
        // 1. Priorizar un formulario marcado explícitamente.
        const markedForm = document.querySelector(
            '[data-booking-form]'
        );

        if (markedForm) return markedForm;

        // 2. Buscar en el contenido de la página.
        const pageContent =
            document.querySelector('main') ||
            document.querySelector('.app__main') ||
            document.querySelector('#root');

        if (!pageContent) return null;

        const forms = Array.from(
            pageContent.querySelectorAll('form')
        );

        // 3. Buscar formularios relacionados con citas.
        const bookingForm = forms.find(form => {
            const text = [
                form.innerText,
                form.getAttribute('aria-label'),
                form.id,
                typeof form.className === 'string'
                    ? form.className
                    : '',
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return /cita|consulta|booking|appointment|agendar/.test(
                text
            );
        });

        if (bookingForm) return bookingForm;

        // 4. Usar el único formulario disponible, si lo hay.
        if (forms.length === 1) return forms[0];

        return null;
    };

    const handleGetDiscount = () => {
        if (!code) return;

        const bookingForm = findBookingForm();

        if (!bookingForm) {
            console.warn(
                'No se encontró un formulario de cita en esta página. ' +
                'Agrega data-booking-form al formulario correspondiente.'
            );
            return;
        }

        // Persistir el código para que sobreviva a una recarga.
        localStorage.setItem(COUPON_TO_USE_KEY, code);
        sessionStorage.setItem(COUPON_TO_USE_KEY, code);

        // Notificar a los formularios que escuchan este evento.
        window.dispatchEvent(
            new CustomEvent('apply-coupon', {
                detail: code,
            })
        );

        // Cerrar sin cambiar de ruta.
        setIsOpen(false);
        onClose?.();

        // Desplazarse al formulario de la página actual.
        window.setTimeout(() => {
            const currentForm = findBookingForm();
            const target = currentForm || bookingForm;

            if (document.contains(target)) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 150);
    };

    const handleBackdropClick = event => {
        if (event.target === event.currentTarget) {
            setIsOpen(false);
            onClose?.();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="coupon-modal"
            onClick={handleBackdropClick}
        >
            <div
                className="coupon-modal__content"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`coupon-title-${code}`}
            >
                {image && (
                    <img
                        className="coupon-modal__background"
                        src={image}
                        alt=""
                        aria-hidden="true"
                    />
                )}

                <div className="coupon-modal__overlay" />

                <div className="coupon-modal__inner">
                    <p className="coupon-modal__brand">
                        ANTON GORBACH
                    </p>

                    <span className="coupon-modal__subtitle">
                        BODY MODIFICATION
                    </span>

                    <div className="coupon-modal__divider">
                        ✦
                    </div>

                    <h2
                        className="coupon-modal__title"
                        id={`coupon-title-${code}`}
                    >
                        <span>{discount}% OFF</span>

                        <span className="coupon-modal__service">
                            en {procedure}
                        </span>
                    </h2>

                    <p className="coupon-modal__description">
                        Una modificación extraordinaria. Una expresión única.
                    </p>

                    <div className="coupon-modal__code">
                        <span>CÓDIGO PROMOCIONAL</span>
                        <strong>{code}</strong>
                    </div>

                    {expirationDate && (
                        <p className="coupon-modal__expiration">
                            Válido hasta el{' '}
                            <strong>{expirationDate}</strong>
                        </p>
                    )}

                    <button
                        type="button"
                        className="coupon-modal__cta"
                        onClick={handleGetDiscount}
                    >
                        OBTENER DESCUENTO
                        <span aria-hidden="true"> ↗</span>
                    </button>

                    <p className="coupon-modal__footnote">
                        Tu código se aplicará al formulario de consulta de esta página.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CouponModal;
