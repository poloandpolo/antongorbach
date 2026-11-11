import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './styles/PriorityBookingModal.scss';

const PriorityBookingModal = ({ isOpen, onClose, onContinue }) => {
    const navigate = useNavigate();

    // Bloquea el scroll del fondo mientras el modal está abierto.
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // Cierra el modal con Escape.
    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = event => {
            if (event.key === 'Escape') onClose?.();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = event => {
        if (event.target === event.currentTarget) onClose?.();
    };

    const handleContinue = () => {
        onClose?.();
        onContinue?.();
        navigate('/priority-appointment-checkout');
    };

    return createPortal(
        <div className="priority-modal" onClick={handleBackdropClick}>
            <section
                className="priority-modal__content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="priority-modal-title"
            >
                <button
                    type="button"
                    className="priority-modal__close"
                    onClick={onClose}
                    aria-label="Cerrar ventana"
                >
                    &times;
                </button>

                <div className="priority-modal__inner">
                    <p className="priority-modal__brand">ANTON GORBACH</p>
                    <span className="priority-modal__subtitle">BODY MODIFICATION</span>
                    <div className="priority-modal__divider" aria-hidden="true">✦</div>

                    <span className="priority-modal__eyebrow">SOLICITUD RECIBIDA</span>
                    <h2 id="priority-modal-title" className="priority-modal__title">
                        Tu próxima modificación comienza aquí
                    </h2>

                    <p className="priority-modal__description">
                        Hemos recibido tu solicitud.
                        <br />
                        Ahora puedes darle prioridad y seleccionar una fecha para tu procedimiento mediante un anticipo.
                    </p>

                    <div className="priority-modal__offer">
                        <span className="priority-modal__offer-label">ANTICIPO DE PRIORIDAD</span>
                        <strong className="priority-modal__price">$70</strong>
                        <span className="priority-modal__currency">USD</span>
                    </div>

                    <div className="priority-modal__benefits">
                        <span>Prioridad en la revisión de tu solicitud</span>
                        <span>Seguimiento de tu proceso de reservación</span>
                    </div>

                    <button
                        type="button"
                        className="priority-modal__cta"
                        onClick={handleContinue}
                    >
                        DAR PRIORIDAD A MI CITA
                        <span aria-hidden="true"> ↗</span>
                    </button>

                    <button
                        type="button"
                        className="priority-modal__secondary"
                        onClick={onClose}
                    >
                        Continuar sin prioridad
                    </button>

                    <p className="priority-modal__footnote">
                        El anticipo corresponde a la solicitud de prioridad.
                        La disponibilidad deberá ser confirmada por Anton.
                    </p>
                </div>
            </section>
        </div>,
        document.body
    );
};

export default PriorityBookingModal;
