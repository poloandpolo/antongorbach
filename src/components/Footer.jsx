import React from 'react';

import './styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer__identity">
        <h2>Anton Gorbach</h2>
        <p>TATUADOR Y MODIFICADOR CORPORAL</p>
      </div>

      <div className="footer__address">
        <span>Estudio</span>
        <p>
          Puebla, Puebla
          <br />
          México
        </p>
      </div>

      <div className="footer__social">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <img src="/instagram_icon.png" alt="Instagram" />
        </a>

        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <img src="/facebook_icon.png" alt="Facebook" />
        </a>

        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <img src="/tiktok_icon.png" alt="TikTok" />
        </a>
      </div>

    </footer>
  );
};

export default Footer;