import React, { useEffect, useState } from 'react';

import '../components/styles/MainCarousel.scss';

const MainCarousel = () => {
  const slides = [
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790190728/WhatsApp_Image_2026-09-21_at_4.30.44_PM_hgsj3c.jpg',
      titleImage: null,
    },

    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.30.48_PM_mwcsgi.jpg',
      titleImage:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790358853/Eyeball_final_bdkhru.png',
    },

    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.20_PM_xhruwu.jpg',
      titleImage: null,
    },

    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.56_PM_r2uhkv.jpg',
      titleImage: null,
    },

    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193185/WhatsApp_Image_2026-09-21_at_4.30.48_PM_1_o4mju2.jpg',
      titleImage: null,
    },

    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.17_PM_v6nc3y.jpg',
      titleImage: null,
    },
  ];

  // ==========================================
  // ESTADOS
  // ==========================================

  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Controla el video inicial
  const [isIntroVideoPlaying, setIsIntroVideoPlaying] = useState(true);

  // ==========================================
  // CARRUSEL
  // ==========================================

  useEffect(() => {
    // Mientras el video está reproduciéndose,
    // el carrusel permanece detenido.
    if (isIntroVideoPlaying) {
      return;
    }

    const introDuration = 5000;
    const slideDuration = 2300;
    const transitionDuration = 800;

    // Detener el carrusel en la última imagen
    if (currentImage === slides.length - 1) {
      return;
    }

    const duration =
      currentImage === 0
        ? introDuration
        : slideDuration;

    let transitionTimeout;

    const slideTimeout = setTimeout(() => {
      setIsTransitioning(true);

      transitionTimeout = setTimeout(() => {
        setCurrentImage((prev) => prev + 1);
        setIsTransitioning(false);
      }, transitionDuration);
    }, duration);

    return () => {
      clearTimeout(slideTimeout);

      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
      }
    };
  }, [
    currentImage,
    slides.length,
    isIntroVideoPlaying,
  ]);

  // ==========================================
  // SLIDES ACTUALES
  // ==========================================

  const currentSlide = slides[currentImage];

  const nextSlide =
    currentImage < slides.length - 1
      ? slides[currentImage + 1]
      : currentSlide;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="main-carousel">

      {/* =====================================================
          VIDEO DE INTRODUCCIÓN
      ===================================================== */}

      {isIntroVideoPlaying && (
        <div className="main-carousel__intro-video">
          <video
            src="https://res.cloudinary.com/djir3xi7x/video/upload/v1790424989/zsky-creation-2.mp4_v_2_1_em5acj.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setIsIntroVideoPlaying(false)}
          />
        </div>
      )}

      {/* =====================================================
          FOTOGRAFÍA
      ===================================================== */}

      <div className="main-carousel__image-container">

        {/* Imagen que sale */}
        {isTransitioning && (
          <img
            className="main-carousel__image main-carousel__image--out"
            src={currentSlide.image}
            alt=""
          />
        )}

        {/* Imagen que entra */}
        <img
          className={`main-carousel__image ${
            isTransitioning
              ? 'main-carousel__image--in'
              : ''
          }`}
          src={
            isTransitioning
              ? nextSlide.image
              : currentSlide.image
          }
          alt="Anton Gorbach"
        />

      </div>

      {/* =====================================================
          FRANJAS NEGRAS
      ===================================================== */}

      {(currentImage > 0 || isTransitioning) && (
        <>
          <div
            className={`main-carousel__frame main-carousel__frame--top ${
              currentImage === 0
                ? 'main-carousel__frame--entering'
                : ''
            }`}
          />

          <div
            className={`main-carousel__frame main-carousel__frame--bottom ${
              currentImage === 0
                ? 'main-carousel__frame--entering'
                : ''
            }`}
          />
        </>
      )}

      {/* =====================================================
          NOMBRE DEL PROCEDIMIENTO
      ===================================================== */}

      {/* TÍTULO ACTUAL */}

      {!isTransitioning && currentSlide.titleImage && (
        <div className="main-carousel__procedure">

          <img
            src={currentSlide.titleImage}
            alt="Nombre del procedimiento"
          />

        </div>
      )}

      {/* TÍTULO QUE SALE */}

      {isTransitioning && currentSlide.titleImage && (
        <div className="main-carousel__procedure main-carousel__procedure--out">

          <img
            src={currentSlide.titleImage}
            alt="Nombre del procedimiento"
          />

        </div>
      )}

      {/* TÍTULO QUE ENTRA */}

      {isTransitioning && nextSlide.titleImage && (
        <div className="main-carousel__procedure main-carousel__procedure--in">

          <img
            src={nextSlide.titleImage}
            alt="Nombre del procedimiento"
          />

        </div>
      )}

      {/* =====================================================
          PORTADA / INTRO
      ===================================================== */}

      {currentImage === 0 && !isIntroVideoPlaying && (
        <div className="main-carousel__slide main-carousel__slide--intro">

          <div className="main-carousel__intro-content">

            {/* Encabezado */}

            <div className="main-carousel__intro-header">

              <span>BODY MODIFICATION</span>

              <span>TATTOO ARTIST</span>

            </div>

            {/* Logo / nombre */}

            <div className="main-carousel__intro-title">

              <img
                src="https://res.cloudinary.com/djir3xi7x/image/upload/v1790355710/Anton_Gorbach_final_l4q2kg.png"
                alt="Anton Gorbach"
              />

            </div>

            {/* Ubicaciones */}

            <footer className="main-carousel__intro-footer">

              <span>PUEBLA</span>

              <span>CDMX</span>

              <span>GUADALAJARA</span>

            </footer>

          </div>

          {/* Revelado inicial desde negro */}

          <div className="main-carousel__intro-reveal" />

        </div>
      )}

    </div>
  );
};

export default MainCarousel;