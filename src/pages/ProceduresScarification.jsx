
import { useEffect, useState } from 'react';
import SlickModule from 'react-slick';
import { Link, useLocation } from 'react-router-dom';

import './styles/ProceduresScarification.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';
import CouponButton from '../components/CouponButton';
import CouponListModal from '../components/CouponListModal';
import useProcedureCoupon from '../hooks/useProcedureCoupon';

const Slider = SlickModule.default ?? SlickModule;

const COUPONS = [
    {
        code: 'SCAR50',
        discount: 50,
        title: 'Scarification',
        description: '50% de descuento en escarificación. Vigencia de 4 meses desde su asignación.',
    },
];

export default function ProceduresScarification() {
    const location = useLocation();

    const [showCouponList, setShowCouponList] = useState(false);
    const [formCoupon, setFormCoupon] = useState('');

    const automaticCoupon = useProcedureCoupon(
        location.pathname,
        'SCAR50',
        4 * 30 * 24 // 4 meses aproximados, en horas
    );

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });
    }, [location.pathname]);

    useEffect(() => {
        if (automaticCoupon) {
            setFormCoupon(automaticCoupon);
        }
    }, [automaticCoupon]);

    const handleUseCoupon = (coupon) => {
        setFormCoupon(coupon.code);
        setShowCouponList(false);

        requestAnimationFrame(() => {
            document
                .getElementById('scarification-booking')
                ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
        });
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: false,
        adaptiveHeight: false,
        accessibility: true,
        pauseOnHover: true,
    };

    return (
        <main className="procedures-scarification">
            <CouponButton
                count={COUPONS.length}
                onClick={() => setShowCouponList(true)}
            />

            <header className="procedures-scarification__header">
                <Link
                    to="/"
                    state={{ scrollToProcedures: true }}
                    className="procedures-scarification__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            <section className="procedures-scarification__slider">
                <Slider {...settings}>
                    <div className="procedures-scarification__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792167180/WhatsApp_Image_2026-09-21_at_4.30.46_PM_1_skaxs2.jpg"
                            alt="Trabajo de escarificación artística"
                        />
                    </div>

                    <div className="procedures-scarification__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792167181/WhatsApp_Image_2026-09-21_at_4.31.19_PM_fqaftd.jpg"
                            alt="Detalle de un diseño de escarificación"
                        />
                    </div>

                    <div className="procedures-scarification__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792167181/WhatsApp_Image_2026-09-21_at_4.31.20_PM_m6d2on.jpg"
                            alt="Resultado artístico de escarificación"
                        />
                    </div>
                </Slider>
            </section>

            <section className="procedures-scarification__description">
                <span className="procedures-scarification__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Scarification</h1>

                <p>
                    La escarificación es una forma de modificación corporal
                    artística que consiste en crear diseños permanentes en la
                    piel mediante lesiones controladas que, durante el proceso
                    de cicatrización, forman patrones y texturas.
                </p>

                <p>
                    Es un procedimiento invasivo que puede provocar infecciones,
                    cicatrices impredecibles, alteraciones de la sensibilidad
                    y otras complicaciones. La cicatrización varía según cada
                    persona y el resultado final no puede garantizarse.
                </p>

                <p>
                    Cada diseño requiere una valoración individual, información
                    clara sobre los riesgos y atención estricta a las medidas
                    de higiene y seguridad. Para solicitar información sobre
                    este procedimiento, utiliza el siguiente formulario.
                </p>
            </section>

            <section
                id="scarification-booking"
                className="procedures-scarification__booking"
            >
                <BookingForm initialCoupon={formCoupon} />
            </section>

            <section className="procedures-scarification__footer">
                <Footer />
            </section>

            <CouponListModal
                isOpen={showCouponList}
                onClose={() => setShowCouponList(false)}
                coupons={COUPONS}
                onUseCoupon={handleUseCoupon}
            />
        </main>
    );
}
