import React, { useEffect, useState } from 'react';
import '../components/styles/MainCarousel.scss';

const images = [
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790190728/WhatsApp_Image_2026-09-21_at_4.30.44_PM_hgsj3c.jpg',
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.30.48_PM_mwcsgi.jpg',
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.20_PM_xhruwu.jpg',
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.56_PM_r2uhkv.jpg',
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193185/WhatsApp_Image_2026-09-21_at_4.30.48_PM_1_o4mju2.jpg',
  'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.17_PM_v6nc3y.jpg',
];

const MainCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);

      setTimeout(() => {
        setCurrentImage((current) => (current + 1) % images.length);
      }, 200);

      setTimeout(() => {
        setIsGlitching(false);
      }, 400);
    }, 2300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-carousel">
      <img
        className={`main-carousel__image ${
          isGlitching ? 'main-carousel__image--glitch' : ''
        }`}
        src={images[currentImage]}
        alt={`Imagen ${currentImage + 1}`}
      />
    </div>
  );
};

export default MainCarousel;