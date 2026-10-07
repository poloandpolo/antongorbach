import React, { useEffect, useRef, useState } from 'react';

import '../components/styles/MainCarousel.scss';

const MainCarousel = ({ onFinish }) => {
  // ==========================================
  // DETECTAR DESKTOP / MOBILE
  // ==========================================

  const [isDesktop, setIsDesktop] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches
  );

  // ==========================================
  // SLIDES
  // ==========================================

  const slides = [
    {
      image: isDesktop
        ? 'https://res.cloudinary.com/djir3xi7x/image/upload/v1791391326/frame-9_jomexs.png'
        : 'https://res.cloudinary.com/djir3xi7x/image/upload/v1791394615/WhatsApp_Image_2026-09-21_at_4.30.44_PM_hgsj3c.png',
      title: null,
    },
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.30.48_PM_mwcsgi.jpg',
      title: 'Eyeball Tattoo',
    },
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.20_PM_xhruwu.jpg',
      title: 'Scarification',
    },
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.56_PM_r2uhkv.jpg',
      title: 'Tongue Split',
    },
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193185/WhatsApp_Image_2026-09-21_at_4.30.48_PM_1_o4mju2.jpg',
      title: ['Subdermal', 'Implant'],
    },
    {
      image:
        'https://res.cloudinary.com/djir3xi7x/image/upload/v1790193186/WhatsApp_Image_2026-09-21_at_4.31.17_PM_v6nc3y.jpg',
      title: 'Tattoo',
    },
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isIntroVideoPlaying, setIsIntroVideoPlaying] =
    useState(true);

  const videoRef = useRef(null);

  // ==========================================
  // DETECTAR CAMBIO DESKTOP / MOBILE
  // ==========================================

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(min-width: 769px)'
    );

    const handleChange = (event) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleChange
      );
    };
  }, []);

  // ==========================================
  // REPRODUCIR VIDEO
  // ==========================================

  useEffect(() => {
    if (!isIntroVideoPlaying) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(
          'No se pudo reproducir el video:',
          error
        );
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, {
        once: true,
      });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, [isDesktop, isIntroVideoPlaying]);

  // ==========================================
  // FINAL DEL VIDEO
  // ==========================================

  const handleIntroVideoEnded = () => {
    setIsIntroVideoPlaying(false);
  };

  // ==========================================
  // CARRUSEL
  // ==========================================

  useEffect(() => {
    if (isIntroVideoPlaying) {
      return;
    }

    const introDuration = 3800;
    const slideDuration = 900;
    const transitionDuration = 800;

    if (currentImage === slides.length - 1) {
      const finishTimeout = setTimeout(() => {
        onFinish?.();
      }, slideDuration);

      return () => {
        clearTimeout(finishTimeout);
      };
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
    onFinish,
  ]);

  // ==========================================
  // SLIDES
  // ==========================================

  const currentSlide = slides[currentImage];

  const nextSlide =
    currentImage < slides.length - 1
      ? slides[currentImage + 1]
      : currentSlide;

  // ==========================================
  // TÍTULOS
  // ==========================================

  const renderTitle = (title) => {
    if (Array.isArray(title)) {
      return (
        <>
          {title.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < title.length - 1 && <br />}
            </React.Fragment>
          ))}
        </>
      );
    }

    return title;
  };

  const getTitleText = (title) => {
    if (Array.isArray(title)) {
      return title.join(' ');
    }

    return title;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="main-carousel">

      {/* ======================================
          INTRO VIDEO
      ====================================== */}

      {isIntroVideoPlaying && (
        <div className="main-carousel__intro-video">
          <video
            ref={videoRef}
            key={
              isDesktop
                ? 'desktop-video'
                : 'mobile-video'
            }
            src={
              isDesktop
                ? 'https://res.cloudinary.com/djir3xi7x/video/upload/v1791391220/zsky-a6b95daa_2_pcu7rn.mp4'
                : 'https://res.cloudinary.com/djir3xi7x/video/upload/v1791386058/zsky-creation-9.mp4_v_2_xdu8pz.mp4'
            }
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleIntroVideoEnded}
          />
        </div>
      )}

      {/* ======================================
          TODO EL CARRUSEL
          SE MONTA DESPUÉS DEL VIDEO
      ====================================== */}

      {!isIntroVideoPlaying && (
        <>

          {/* FOTOGRAFÍA */}

          <div className="main-carousel__image-container">

            {isTransitioning && (
              <img
                className="
                  main-carousel__image
                  main-carousel__image--out
                "
                src={currentSlide.image}
                alt=""
              />
            )}

            <img
              className={`
                main-carousel__image
                ${isTransitioning
                  ? 'main-carousel__image--in'
                  : ''
                }
              `}
              src={
                isTransitioning
                  ? nextSlide.image
                  : currentSlide.image
              }
              alt="Anton Gorbach"
            />

          </div>

          {/* FRANJAS */}

          {(currentImage > 0 || isTransitioning) && (
            <>
              <div
                className="
                  main-carousel__frame
                  main-carousel__frame--top
                "
              />

              <div
                className="
                  main-carousel__frame
                  main-carousel__frame--bottom
                "
              />
            </>
          )}

          {/* TÍTULO ACTUAL */}

          {!isTransitioning &&
            currentSlide.title && (
              <div className="main-carousel__procedure">
                <span
                  data-text={getTitleText(
                    currentSlide.title
                  )}
                >
                  {renderTitle(
                    currentSlide.title
                  )}
                </span>
              </div>
            )}

          {/* TÍTULO QUE SALE */}

          {isTransitioning &&
            currentSlide.title && (
              <div
                className="
                  main-carousel__procedure
                  main-carousel__procedure--out
                "
              >
                <span
                  data-text={getTitleText(
                    currentSlide.title
                  )}
                >
                  {renderTitle(
                    currentSlide.title
                  )}
                </span>
              </div>
            )}

          {/* TÍTULO QUE ENTRA */}

          {isTransitioning &&
            nextSlide.title && (
              <div
                className="
                  main-carousel__procedure
                  main-carousel__procedure--in
                "
              >
                <span
                  data-text={getTitleText(
                    nextSlide.title
                  )}
                >
                  {renderTitle(
                    nextSlide.title
                  )}
                </span>
              </div>
            )}

          {/* CONTENIDO DEL PRIMER SLIDE */}

          {currentImage === 0 && (
            <div
              className="
                main-carousel__slide
                main-carousel__slide--intro
              "
            >
              <div className="main-carousel__intro-content">

                <div className="main-carousel__intro-header">
                  <span>BODY MODIFICATION</span>
                  <span>TATTOO ARTIST</span>
                </div>

                <div className="main-carousel__intro-title">
                  <p className="main-carousel__intro-name">
                    <span data-text="Anton">Anton</span>
                    <span data-text="Gorbach">Gorbach</span>
                  </p>
                </div>

                <footer className="main-carousel__intro-footer">
                  <span>PUEBLA</span>
                  <span>CDMX</span>
                  <span>GUADALAJARA</span>
                </footer>

              </div>

              <div className="main-carousel__intro-reveal" />
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default MainCarousel;