
import { useEffect } from 'react';
import SlickModule from 'react-slick';
import { Link, useLocation } from 'react-router-dom';

import './styles/ProceduresToungeSplit.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

import useProcedureCoupon from '../hooks/useProcedureCoupon';
import { COUPONS } from '../data/coupons';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresTongueSplit() {
    const location = useLocation();

    const couponConfig = COUPONS.find(
        coupon => coupon.code === 'TONGUE60'
    );

    useProcedureCoupon(
        location.pathname,
        couponConfig?.code,
        couponConfig?.validityMonths
    );

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });
    }, [location.pathname]);

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
        <main className="procedures-tongue-split">
            <header className="procedures-tongue-split__header">
                <Link
                    to="/"
                    state={{ scrollToProcedures: true }}
                    className="procedures-tongue-split__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            <section className="procedures-tongue-split__slider">
                <Slider {...settings}>
                    <div className="procedures-tongue-split__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168248/WhatsApp_Image_2026-09-21_at_4.31.09_PM_spkirf.jpg"
                            alt="Procedimiento de bifurcación lingual"
                        />
                    </div>

                    <div className="procedures-tongue-split__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168248/WhatsApp_Image_2026-09-21_at_4.31.20_PM_vdkcmy.jpg"
                            alt="Detalle de modificación lingual"
                        />
                    </div>

                    <div className="procedures-tongue-split__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168248/WhatsApp_Image_2026-09-21_at_4.31.56_PM_pzullh.jpg"
                            alt="Resultado de una bifurcación lingual"
                        />
                    </div>
                </Slider>
            </section>

            <section className="procedures-tongue-split__description">
                <span className="procedures-tongue-split__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Tongue Split</h1>


                <p>
                    La bifurcación lingual, conocida internacionalmente como <i>tongue split</i>, representa una de las intervenciones más definitivas y complejas sobre la anatomía humana. Mediante la separación longitudinal de la porción anterior de la lengua, se transforma de raíz la configuración de un órgano clave, fusionando una estética radical con un desafío anatómico de alta precisión.
                </p>

                <p>
                    Al intervenir un tejido altamente vascularizado e inervado, los riesgos inherentes no admiten margen para la improvisación: desde hemorragias severas e infecciones hasta daño nervioso, alteraciones en la sensibilidad, problemas de movilidad o dificultades permanentes en el habla y la deglución. Ningún procedimiento de esta naturaleza está exento de complicaciones imprevistas ni puede garantizar un resultado funcional o estético absoluto.
                </p>

                <p>
                    Bajo la experiencia y el criterio técnico de Anton Gorbach, este tipo de procedimientos se abordan desde el análisis riguroso de la viabilidad anatómica y la máxima seguridad. Si estás considerando dar este paso y necesitas una evaluación profesional, honesta y detallada sobre sus riesgos, limitaciones técnicas y cuidados, te invitamos a completar el formulario a continuación para iniciar el proceso de revisión de tu caso.
                </p>

            </section>

            <section className="procedures-tongue-split__booking">
                <BookingForm />
            </section>

            <section className="procedures-tongue-split__footer">
                <Footer />
            </section>
        </main>
    );
}
