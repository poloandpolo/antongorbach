import React from 'react';

import './styles/ArtistBio.scss';

const ArtistBio = () => {
    return (
        <section className="artist-bio">
            <div className="artist-bio__portrait">
                <img
                    src="https://res.cloudinary.com/djir3xi7x/image/upload/v1791815524/WhatsApp_Image_2026-09-21_at_4.30.48_PM_2_q9q4n8.jpg"
                    alt="Retrato de Anton Gorbach"
                />
            </div>

            <h1>Anton Gorbach</h1>

  <div className="artist-bio__description">
  <p>
    Llevo más de una década convirtiendo la piel en lienzo y el cuerpo
    en una declaración de identidad. Soy tatuador y modificador corporal.
  </p>

  <p>
    Me especializo en <strong>blackwork, black and grey, blackout y dark
    ornamental</strong>. Mi trayectoria en el tatuaje me ha llevado a recibir múltiples premios en convenciones
    y exposiciones, mientras continúo consolidando mi camino en el mundo
    de la modificación corporal.
  </p>

  <p>
    Como ponente en seminarios de modificación corporal y especialista
    en <strong>eyeball tattoo</strong>, comparto mis conocimientos y
    experiencia con una comunidad que busca comprender y llevar más allá
    los límites del arte corporal.
  </p>

  <p>
    Cada procedimiento lo abordo de manera individualizada, porque
    entiendo que cada cuerpo tiene su propia anatomía, historia e
    identidad. Trabajo con protocolos de higiene y un entorno controlado,
    priorizando la seguridad, la atención personalizada y la precisión
    técnica en cada intervención, con el objetivo de lograr resultados
    que respondan a las características y expectativas de cada persona.
  </p>

  <p>
    Para mí, modificar el cuerpo va más allá de transformar la apariencia.
    Es explorar la identidad, desafiar lo convencional y expresar aquello
    que las palabras no siempre pueden transmitir.
  </p>

  <p>
    <strong>
      La piel es mi lienzo. El cuerpo, mi medio de expresión.
      La transformación, mi lenguaje.
    </strong>
  </p>

</div>
        </section>
    );
};

export default ArtistBio;