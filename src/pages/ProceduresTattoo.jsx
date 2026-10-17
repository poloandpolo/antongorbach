import { useEffect } from 'react';
import SlickModule from 'react-slick';
import { Link, useLocation } from 'react-router-dom';

import './styles/ProceduresTattoo.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresTattoo() {
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
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168949/WhatsApp_Image_2026-09-21_at_4.30.45_PM_fpop9t.jpg"
                            alt="Trabajo de tatuaje realizado por Anton Gorbach"
                        />
                    </div>

                    <div className="procedures-tattoo__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168949/WhatsApp_Image_2026-09-21_at_4.30.46_PM_akhkji.jpg"
                            alt="Detalle de un diseño de tatuaje"
                        />
                    </div>

                    <div className="procedures-tattoo__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168950/WhatsApp_Image_2026-09-21_at_4.30.47_PM_c1psvh.jpg"
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
                    El tatuaje es una forma de expresión artística que transforma
                    la piel en un espacio para plasmar ideas, símbolos e historias
                    personales. Cada diseño puede desarrollarse de manera
                    individual para reflejar la identidad y visión de quien lo lleva.
                </p>

                <p>
                    Con más de diez años de experiencia, Anton Gorbach trabaja
                    estilos como blackwork, black and grey, blackout y dark
                    ornamental, creando composiciones que buscan equilibrio,
                    carácter y personalidad.
                </p>

                <p>
                    Cada proyecto se plantea de forma personalizada, considerando
                    el diseño, la ubicación y las características de la piel.
                    Los procedimientos deben realizarse con medidas apropiadas
                    de higiene y seguridad. Para consultar sobre un diseño o
                    solicitar información, utiliza el siguiente formulario.
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