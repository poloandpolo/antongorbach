import React from 'react';

const ProcedureCard = ({ procedure }) => {
  return (
    <article className="procedure-card">

      <div className="procedure-card__image">

        <img
          src={procedure.image}
          alt={procedure.title}
        />

      </div>


      <div className="procedure-card__content">

        <h3>
          {procedure.title}
        </h3>

        <button type="button">
          SABER MÁS
        </button>

      </div>

    </article>
  );
};

export default ProcedureCard;