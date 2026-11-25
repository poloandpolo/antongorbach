
import { useEffect } from 'react';
import SlickModule from 'react-slick';
import { Link, useLocation } from 'react-router-dom';

import './styles/ProceduresTattoo.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

import Tatto1 from '../../Images/Procedimientos/Tattoo/Tatto_1.jpeg'
import Tatto2 from '../../Images/Procedimientos/Tattoo/Tatto_2.jpeg'
import Tatto3 from '../../Images/Procedimientos/Tattoo/Tatto_3.jpeg'

import useProcedureCoupon from '../hooks/useProcedureCoupon';
import { COUPONS } from '../data/coupons';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresTattoo() {
    const location = useLocation();

    const couponConfig = COUPONS.find(
        coupon => coupon.code === 'TATTOO60'
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
        <main className="procedures-tattoo">
            <header className="procedures-tattoo__header">
                <Link
                    to="/"
                    state={{ scrollToProcedures: true }}
                    className="procedures-tattoo__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            <section className="procedures-tattoo__slider">
                <Slider {...settings}>
                    <div className="procedures-tattoo__slide">
                        <img
                            src={Tatto1}
                            alt="Trabajo de tatuaje realizado por Anton Gorbach"
                        />
                    </div>

                    <div className="procedures-tattoo__slide">
                        <img
                            src={Tatto2}
                            alt="Detalle de un diseño de tatuaje"
                        />
                    </div>

                    <div className="procedures-tattoo__slide">
                        <img
                            src={Tatto3}
                            alt="Resultado de un tatuaje"
                        />
                    </div>
                </Slider>
            </section>

            <section className="procedures-tattoo__description">
                <span className="procedures-tattoo__eyebrow">
                    ANTON GORBACH · TATTOO ARTIST
                </span>

                <h1>Tattoo</h1>

                <p>
                    El tatuaje trasciende lo meramente decorativo para convertirse en una marca permanente de identidad y carácter. A diferencia de las tendencias pasajeras, una pieza bien concebida transforma la piel en un soporte arquitectónico para plasmar símbolos e historias personales con fuerza visual y coherencia estética a lo largo del tiempo.
                </p>

                <p>
                    Con más de diez años de trayectoria, Anton Gorbach especializa su trabajo en estilos de alto contraste y solidez técnica como el <i>blackwork</i>, <i>black and grey</i>, <i>blackout</i> y <i>dark ornamental</i>. Su enfoque prioriza el equilibrio anatómico y la durabilidad del pigmento, desarrollando composiciones diseñadas específicamente para fluir con la musculatura y estructura natural de cada cuerpo.
                </p>

                <p>
                    Cada proyecto se concibe de forma individual y bajo estrictos protocolos de higiene y seguridad, evaluando a fondo la viabilidad del diseño, la zona anatómica y las características de tu piel antes de iniciar. Si tienes una idea en mente y buscas desarrollar una pieza sólida y personalizada, completa el formulario a continuación para iniciar la valoración de tu proyecto.
                </p>
            </section>

            <section className="procedures-tattoo__booking">
                <BookingForm />
            </section>

            <section className="procedures-tattoo__footer">
                <Footer />
            </section>
        </main>
    );
}
