import SlickModule from 'react-slick';
import { Link } from 'react-router-dom';

import './styles/ProceduresToungeSplit.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresTongueSplit() {
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
            {/* Navegación de regreso */}
            <header className="procedures-tongue-split__header">
                <Link
                    to="/#app_procedures"
                    className="procedures-tongue-split__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            {/* Slider principal */}
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

            {/* Descripción */}
            <section className="procedures-tongue-split__description">
                <span className="procedures-tongue-split__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Tongue Split</h1>

                <p>
                    La bifurcación lingual, conocida como tongue split, es una
                    modificación corporal que consiste en dividir parcialmente
                    la lengua para crear una apariencia bifurcada.
                </p>

                <p>
                    Es un procedimiento invasivo que puede ocasionar hemorragias,
                    infecciones, lesiones nerviosas, alteraciones de la movilidad
                    y otras complicaciones graves. La anatomía, la recuperación
                    y los resultados varían de una persona a otra.
                </p>

                <p>
                    Antes de considerar esta modificación, es fundamental
                    conocer sus riesgos, recibir información individualizada
                    y consultar con profesionales médicos cualificados.
                    Para solicitar información sobre este procedimiento,
                    utiliza el siguiente formulario.
                </p>
            </section>

            {/* Formulario a ancho completo */}
            <section className="procedures-tongue-split__booking">
                <BookingForm />
            </section>

            {/* Footer a ancho completo */}
            <section className="procedures-tongue-split__footer">
                <Footer />
            </section>
        </main>
    );
}