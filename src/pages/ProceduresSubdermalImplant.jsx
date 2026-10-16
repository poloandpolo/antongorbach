import SlickModule from 'react-slick';
import { Link } from 'react-router-dom';

import './styles/ProceduresSubdermalImplant.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresSubdermalImplant() {
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
        <main className="procedures-subdermal-implant">
            {/* Navegación de regreso */}
            <header className="procedures-subdermal-implant__header">
                <Link
                    to="/#app_procedures"
                    className="procedures-subdermal-implant__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            {/* Slider principal */}
            <section className="procedures-subdermal-implant__slider">
                <Slider {...settings}>
                    <div className="procedures-subdermal-implant__slide">
                        <img
                            src="https://res.cloudinary.com/djir3xi7x/image/upload/v1792168643/WhatsApp_Image_2026-09-21_at_4.30.48_PM_dttefk.jpg"
                            alt="Procedimiento de implante subdérmico"
                        />
                    </div>

                    <div className="procedures-subdermal-implant__slide">
                        <img
                            src="/images/subdermal-implant-2.jpg"
                            alt="Detalle de modificación corporal con implante subdérmico"
                        />
                    </div>

                    <div className="procedures-subdermal-implant__slide">
                        <img
                            src="/images/subdermal-implant-3.jpg"
                            alt="Resultado de un implante subdérmico"
                        />
                    </div>
                </Slider>
            </section>

            {/* Descripción */}
            <section className="procedures-subdermal-implant__description">
                <span className="procedures-subdermal-implant__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Subdermal Implant</h1>

                <p>
                    Los implantes subdérmicos son una forma de modificación
                    corporal en la que se coloca un implante debajo de la piel
                    para crear un relieve o una forma determinada en la superficie
                    del cuerpo.
                </p>

                <p>
                    Este procedimiento puede implicar riesgos como infección,
                    sangrado, cicatrización anómala, rechazo o desplazamiento del
                    implante y daño a estructuras cercanas. Los riesgos dependen
                    de la zona, el material utilizado y las características
                    individuales de cada persona.
                </p>

                <p>
                    Antes de considerar esta modificación, es importante conocer
                    sus posibles complicaciones y recibir una valoración
                    individualizada de un profesional sanitario cualificado.
                    Para solicitar información sobre este procedimiento,
                    utiliza el siguiente formulario.
                </p>
            </section>

            {/* Formulario a ancho completo */}
            <section className="procedures-subdermal-implant__booking">
                <BookingForm />
            </section>

            {/* Footer a ancho completo */}
            <section className="procedures-subdermal-implant__footer">
                <Footer />
            </section>
        </main>
    );
}