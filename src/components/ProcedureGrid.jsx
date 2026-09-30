import React from 'react';

import ProcedureCard from './ProcedureCard';

import './styles/ProcedureGrid.scss';

const ProcedureGrid = () => {
  const procedures = [
    {
      slug: 'eyeball-tattoo',
      title: 'Eyeball Tattoo',
      image: 'https://res.cloudinary.com/djir3xi7x/image/upload/v1790785327/eyeball_a37oje.jpg',
    },
    {
      slug: 'scarification',
      title: 'Scarification',
      image: 'https://res.cloudinary.com/djir3xi7x/image/upload/v1790785327/scar_qzmkss.jpg',
    },
    {
      slug: 'tongue-split',
      title: 'Tounge Split',
      image: 'https://res.cloudinary.com/djir3xi7x/image/upload/v1790785328/tounge_split_mhdsnu.jpg',
    },
    {
      slug: 'subdermal-implant',
      title: 'Subdemal / Implant',
      image: 'https://res.cloudinary.com/djir3xi7x/image/upload/v1790785327/subdemal_implants_xiaoql.jpg',
    },
    {
      slug: 'tattoo',
      title: 'Tattoo',
      image: 'https://res.cloudinary.com/djir3xi7x/image/upload/v1790785328/tattoo_ogkqed.jpg',
    },
  ];

  return (
    <section className="procedure-grid">
      <div className="procedure-grid__header">
        <h2>Procedimientos</h2>
      </div>

      <div className="procedure-grid__content">
        {procedures.map((procedure) => (
          <ProcedureCard
            key={procedure.slug}
            procedure={procedure}
          />
        ))}
      </div>
    </section>
  );
};

export default ProcedureGrid;   