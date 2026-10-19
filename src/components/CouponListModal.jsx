import { useEffect } from 'react';
import './styles/CouponListModal.scss';

const COUPON_TO_USE_KEY = 'couponToUse';

const formatExpiration = (expiresAt, validityMonths) => {
    let date;

    if (expiresAt) {
        date = new Date(expiresAt);
    } else if (validityMonths) {
        date = new Date();
        date.setMonth(date.getMonth() + validityMonths);
    } else {
        return null;
    }

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Busca primero un formulario identificado explícitamente.
 * Después busca formularios de cita en el contenido principal.
 */
const findBookingForm = () => {
    const markedForm = document.querySelector(
        '[data-booking-form]'
    );

    if (markedForm) return markedForm;

    const containers = [
        document.querySelector('.app__main'),
        document.querySelector('main'),
        document.querySelector('#root'),
    ].filter(Boolean);

    const visited = new Set();

    for (const container of containers) {
        const forms = Array.from(
            container.querySelectorAll('form')
        ).filter((form) => {
            if (visited.has(form)) return false;
            visited.add(form);
            return true;
        });

        const bookingForm = forms.find((form) => {
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

        if (forms.length === 1) return forms[0];
    }

    return null;
};

const CouponListModal = ({
    isOpen,
    onClose,
    coupons = [],
    onUseCoupon,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUseCoupon = (coupon) => {
        if (!coupon?.code) return;

        const expirationTime = coupon.expiresAt
            ? new Date(coupon.expiresAt).getTime()
            : null;

        const expired =
            expirationTime !== null &&
            !Number.isNaN(expirationTime) &&
            expirationTime <= Date.now();

        if (expired) return;

        // Guardar el cupón para que el formulario pueda recuperarlo.
        try {
            localStorage.setItem(
                COUPON_TO_USE_KEY,
                coupon.code
            );

            sessionStorage.setItem(
                COUPON_TO_USE_KEY,
                coupon.code
            );
        } catch (error) {
            console.error(
                'No se pudo guardar el cupón seleccionado:',
                error
            );
        }

        // Notificar a los formularios que estén escuchando el evento.
        window.dispatchEvent(
            new CustomEvent('apply-coupon', {
                detail: coupon.code,
            })
        );

        // Actualizar el estado del componente padre.
        onUseCoupon?.(coupon);

        // Cerrar el modal.
        onClose?.();

        // Esperar a que React cierre el modal y localizar el formulario.
        window.setTimeout(() => {
            const bookingForm = findBookingForm();

            if (!bookingForm || !document.contains(bookingForm)) {
                console.warn(
                    'No se encontró el formulario. ' +
                    'Agrega data-booking-form al formulario de cita.'
                );
                return;
            }

            bookingForm.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });

            // Dar tiempo al desplazamiento antes de enfocar el formulario.
            window.setTimeout(() => {
                const firstField = bookingForm.querySelector(
                    'input:not([type="hidden"]):not([disabled]), ' +
                    'select:not([disabled]), ' +
                    'textarea:not([disabled]), ' +
                    'button:not([disabled])'
                );

                if (firstField) {
                    firstField.focus({ preventScroll: true });
                }
            }, 450);
        }, 200);
    };

    return (
        <div
            className="coupon-list-modal"
            role="presentation"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <section
                className="coupon-list-modal__content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="coupon-list-title"
            >
                <button
                    type="button"
                    className="coupon-list-modal__close"
                    onClick={onClose}
                    aria-label="Cerrar cupones"
                >
                    &times;
                </button>

                <header className="coupon-list-modal__header">
                    <span className="coupon-list-modal__eyebrow">
                        OFERTAS EXCLUSIVAS
                    </span>

                    <h2 id="coupon-list-title">
                        Cupones disponibles
                    </h2>

                    <p>
                        Aprovecha estas promociones en tus procedimientos.
                    </p>
                </header>

                <div className="coupon-list-modal__list">
                    {coupons.length > 0 ? (
                        coupons.map((coupon) => {
                            const expirationDate = formatExpiration(
                                coupon.expiresAt,
                                coupon.validityMonths
                            );

                            const expirationTime = coupon.expiresAt
                                ? new Date(coupon.expiresAt).getTime()
                                : null;

                            const expired =
                                expirationTime !== null &&
                                !Number.isNaN(expirationTime) &&
                                expirationTime <= Date.now();

                            return (
                                <article
                                    className={`coupon-list-modal__coupon ${
                                        expired
                                            ? 'coupon-list-modal__coupon--expired'
                                            : ''
                                    }`}
                                    key={coupon.code}
                                >
                                    <div className="coupon-list-modal__discount">
                                        <span>{coupon.discount}%</span>
                                        <small>OFF</small>
                                    </div>

                                    <div className="coupon-list-modal__details">
                                        <h3>
                                            {coupon.title || coupon.procedure}
                                        </h3>

                                        <p>{coupon.description}</p>

                                        <div className="coupon-list-modal__code">
                                            <span>CÓDIGO:</span>
                                            <strong>{coupon.code}</strong>
                                        </div>

                                        <p className="coupon-list-modal__expiration">
                                            {expired ? (
                                                <span>Cupón vencido</span>
                                            ) : expirationDate ? (
                                                <>
                                                    Válido hasta el{' '}
                                                    <strong>
                                                        {expirationDate}
                                                    </strong>
                                                </>
                                            ) : (
                                                'Fecha de caducidad no disponible'
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="coupon-list-modal__use"
                                        disabled={expired}
                                        onClick={() =>
                                            handleUseCoupon(coupon)
                                        }
                                    >
                                        {expired
                                            ? 'Vencido'
                                            : 'Usar cupón'}
                                    </button>
                                </article>
                            );
                        })
                    ) : (
                        <p className="coupon-list-modal__empty">
                            No hay cupones disponibles por el momento.
                        </p>
                    )}
                </div>

                <footer className="coupon-list-modal__footer">
                    <p>
                        Los descuentos están sujetos a las condiciones
                        de cada promoción.
                    </p>
                </footer>
            </section>
        </div>
    );
};

export default CouponListModal;