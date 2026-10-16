
import React from 'react';
import { Link } from 'react-router-dom';

const ProcedureCard = ({ procedure }) => {
  return (
    <article className="procedure-card">
      <Link
        to={procedure.path}
        className="procedure-card__link"
        aria-label={`Conocer más sobre ${procedure.title}`}
      >
        <div className="procedure-card__image">
          <img
            src={procedure.image}
            alt={procedure.title}
          />
        </div>

        <div className="procedure-card__content">
          <h3>{procedure.title}</h3>

          <span className="procedure-card__button">
            SABER MÁS
          </span>
        </div>
      </Link>
    </article>
  );
};

export default ProcedureCard;
