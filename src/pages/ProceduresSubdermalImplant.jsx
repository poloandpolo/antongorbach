import { useEffect } from 'react';
import SlickModule from 'react-slick';
import { Link, useLocation } from 'react-router-dom';

import './styles/ProceduresSubdermalImplant.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import BookingForm from '../components/BookingForm';
import Footer from '../components/Footer';

import Implant1 from '../../Images/Procedimientos/Subdermal Implant/Implant_1.jpeg'

import useProcedureCoupon from '../hooks/useProcedureCoupon';
import { COUPONS } from '../data/coupons';

const Slider = SlickModule.default ?? SlickModule;

export default function ProceduresSubdermalImplant() {
    const location = useLocation();

    const couponConfig = COUPONS.find(
        (coupon) => coupon.code === 'IMPLANT60'
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
        <main className="procedures-subdermal-implant">
            <header className="procedures-subdermal-implant__header">
                <Link
                    to="/"
                    state={{ scrollToProcedures: true }}
                    className="procedures-subdermal-implant__back"
                    aria-label="Volver a explorar los procedimientos"
                >
                    <span aria-hidden="true">←</span>
                    <span>Explorar otros procedimientos</span>
                </Link>
            </header>

            <section className="procedures-subdermal-implant__slider">
                <Slider {...settings}>
                    <div className="procedures-subdermal-implant__slide">
                        <img
                            src={Implant1}
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

            <section className="procedures-subdermal-implant__description">
                <span className="procedures-subdermal-implant__eyebrow">
                    ANTON GORBACH · BODY MODIFICATION
                </span>

                <h1>Subdermal Implant</h1>

                <p>
                    Los implantes subdérmicos representan una intervención de modificación corporal diseñada para alterar de forma permanente la topografía de la piel, colocando piezas de diseño anatómico bajo los tejidos para generar volúmenes y relieves estructurados. Una práctica que exige un dominio absoluto tanto de la estética visual como de la biomecánica corporal.
                </p>

                <p>
                    Al alterar la integridad de los tejidos, este procedimiento conlleva riesgos inevitables que no deben tomarse a la ligera: infecciones, sangrado, cicatrización anómala, rechazo o desplazamiento del implante y posibles daños a estructuras vasculares o nerviosas cercanas. La viabilidad del resultado depende críticamente de la calidad de los materiales, la zona elegida y la respuesta biológica individual.
                </p>

                <p>
                    Bajo la experiencia y el rigor técnico de Anton Gorbach, cada implante se aborda desde una perspectiva de seguridad anatómica y diseño personalizado. Si estás evaluando este tipo de modificación y requieres una valoración honesta y profesional sobre sus riesgos, materiales y viabilidad en tu anatomía, te invitamos a completar el formulario a continuación para iniciar el proceso de revisión.
                </p>
            </section>

            <section
                className="procedures-subdermal-implant__booking"
                data-booking-form
            >
                <BookingForm />
            </section>

            <section className="procedures-subdermal-implant__footer">
                <Footer />
            </section>
        </main>
    );
}