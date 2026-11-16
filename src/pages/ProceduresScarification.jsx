
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
                    A través de incisiones y lesiones cuidadosamente diseñadas, la escarificación crea composiciones orgánicas que evolucionan durante la cicatrización, dando lugar a relieves, contrastes y texturas irrepetibles. Cada pieza constituye una transformación permanente y radical cuya apariencia final no depende solo del trazo, sino de la respuesta biológica única de tu cuerpo.
                </p>

                <p>
                    Por su naturaleza invasiva, existen variables críticas que no admiten improvisación: infecciones, cicatrización hipertrófica o queloide, alteraciones de la sensibilidad, cambios en la pigmentación y resultados estéticos impredecibles. Incluso bajo protocolos estrictos de higiene y cuidados posteriores, la respuesta del tejido nunca es 100% controlable ni se puede garantizar un acabado idéntico al boceto.
                </p>

                <p>
                    En el trabajo de Anton Gorbach, cada proyecto se aborda desde el rigor técnico, el diseño anatómico personalizado y una evaluación honesta de lo que tu piel puede lograr. Si buscas explorar la escarificación con total claridad sobre sus técnicas, cuidados y riesgos reales, completa el formulario a continuación.
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
