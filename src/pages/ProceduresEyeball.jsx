import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SlickModule from 'react-slick';

import './styles/ProceduresEyeball.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresEyeball() {
    const location = useLocation();

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
        <main className="procedures-eyeball">
            <header className="procedures-eyeball__header">
                <Link
                    to="/"
                    state={{ scrollToProcedures: true }}
                    className="procedures-eyeball__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            <section className="procedures-eyeball__slider">
                <Slider {...settings}>
                    <div className="procedures-eyeball__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792165270/WhatsApp_Image_2026-09-21_at_4.31.14_PM_hjaj6u.jpg"
                            alt="Procedimiento de tatuaje escleral realizado por Anton Gorbach"
                        />
                    </div>

                    <div className="procedures-eyeball__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792165270/WhatsApp_Image_2026-09-21_at_4.30.48_PM_ls865u.jpg"
                            alt="Detalle de modificación ocular"
                        />
                    </div>

                    <div className="procedures-eyeball__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792165270/WhatsApp_Image_2026-09-21_at_4.30.43_PM_fk1en8.jpg"
                            alt="Resultado de tatuaje escleral"
                        />
                    </div>
                </Slider>
            </section>

            <section className="procedures-eyeball__description">
                <span className="procedures-eyeball__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Eyeball Tattoo</h1>

                <p>
                    El tatuaje escleral es una forma especializada de modificación
                    corporal que busca alterar la apariencia de la esclerótica,
                    la parte blanca del ojo, mediante la introducción de pigmento.
                </p>

                <p>
                    Es una intervención de alto riesgo que puede ocasionar
                    complicaciones graves y pérdida permanente de visión.
                    Es fundamental conocer los riesgos y recibir información
                    especializada antes de considerar cualquier procedimiento.
                </p>

                <p>
                    Anton Gorbach cuenta con experiencia en modificación corporal.
                    Para solicitar información sobre este procedimiento, utiliza
                    el siguiente formulario de contacto.
                </p>
            </section>

            <section className="procedures-eyeball__booking">
                <BookingForm />
            </section>

            <section className="procedures-eyeball__footer">
                <Footer />
            </section>
        </main>
    );
}