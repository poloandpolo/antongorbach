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
          Con más de una década de trayectoria, Anton Gorbach se ha dedicado a convertir la piel en un lienzo y el cuerpo en una auténtica declaración de identidad. Como tatuador y modificador corporal, su trabajo nace del respeto profundo por la expresión individual y la búsqueda estética constante.
        </p>

        <p>
          En el ámbito del tatuaje, se especializa en <strong>blackwork, black and grey, blackout y dark ornamental</strong>. Su dedicación y dominio técnico lo han llevado a recibir múltiples reconocimientos en convenciones y exposiciones, además de consolidarse como ponente en seminarios especializados de tatuaje donde comparte su experiencia con otros profesionales del medio.
        </p>

        <p>
          En el terreno de la modificación corporal, Anton destaca especialmente como <strong>especialista en eyeball tattoo</strong>, una de las intervenciones más delicadas y exigentes de la disciplina. Esta especialidad se respalda en una formación constante a través de diversos seminarios de modificación corporal, donde ha perfeccionado su criterio anatómico y técnico para abordar procedimientos de alta complejidad.
        </p>

        <p>
          Aborda cada intervención de manera cercana e individualizada, entendiendo que cada cuerpo posee su propia anatomía, historia e identidad. Trabaja bajo estrictos protocolos de higiene y en un entorno controlado, priorizando siempre la seguridad, la escucha activa y la precisión técnica para lograr resultados honestos y acordes a cada persona.
        </p>

        <p>
          Para él, intervenir el cuerpo va mucho más allá de transformar la apariencia física: es un proceso íntimo para explorar la identidad, desafiar lo convencional y expresar aquello que las palabras no siempre alcanzan a transmitir.
        </p>

        <p>
          <strong>
            La piel es su lienzo. El cuerpo, su medio de expresión.
            La transformación, su lenguaje.
          </strong>
        </p>

      </div>
    </section>
  );
};

export default ArtistBio;