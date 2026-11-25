import React, { useEffect, useRef, useState } from 'react';

import '../components/styles/MainCarousel.scss';

import Anton_1_mobile from '../../Images/Maincarrousel/Anton_1_mobile.jpeg';
import Anton_1_desktop from '../../Images/Maincarrousel/Anton_1_desktop.png';
import Eyeball from '../../Images/Maincarrousel/Eyeball.jpeg';
import Scar from '../../Images/Maincarrousel/Scar.jpeg';
import Implant from '../../Images/Maincarrousel/Implant.jpeg';
import Tongue from '../../Images/Maincarrousel/Tongue.jpeg';
import Tattoo from '../../Images/Maincarrousel/Tattoo.jpeg';

const Slider = ({ onFinish }) => {
    const firstImageRef = useRef(null);

    const [isDesktop, setIsDesktop] = useState(() =>
        window.matchMedia('(min-width: 769px)').matches
    );
    const [currentImage, setCurrentImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [firstImageLoaded, setFirstImageLoaded] = useState(false);

    const slides = [
        {
            image: isDesktop ? Anton_1_desktop : Anton_1_mobile,
            title: null,
        },
        { image: Eyeball, title: 'Eyeball Tattoo' },
        { image: Scar, title: 'Scarification' },
        { image: Tongue, title: 'Tongue Split' },
        { image: Implant, title: ['Subdermal', 'Implant'] },
        { image: Tattoo, title: 'Tattoo' },
    ];

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 769px)');
        const handleChange = event => setIsDesktop(event.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Detecta también si el navegador ya tiene la imagen en caché.
    useEffect(() => {
        if (currentImage !== 0 || isTransitioning || firstImageLoaded) {
            return undefined;
        }

        const image = firstImageRef.current;

        if (!image?.complete || image.naturalWidth === 0) {
            return undefined;
        }

        const frame = window.requestAnimationFrame(() => {
            setFirstImageLoaded(true);
        });

        return () => window.cancelAnimationFrame(frame);
    }, [currentImage, isTransitioning, firstImageLoaded, isDesktop]);

    useEffect(() => {
        // Espera a que la primera imagen esté lista.
        if (currentImage === 0 && !firstImageLoaded) {
            return undefined;
        }

        const firstSlideDuration = 2900;
        const slideDuration = 900;
        const transitionDuration = 800;

        if (currentImage === slides.length - 1) {
            const finishTimeout = window.setTimeout(() => {
                onFinish?.();
            }, slideDuration);

            return () => window.clearTimeout(finishTimeout);
        }

        const duration =
            currentImage === 0 ? firstSlideDuration : slideDuration;

        let transitionTimeout;

        const slideTimeout = window.setTimeout(() => {
            setIsTransitioning(true);

            transitionTimeout = window.setTimeout(() => {
                setCurrentImage(previous => previous + 1);
                setIsTransitioning(false);
            }, transitionDuration);
        }, duration);

        return () => {
            window.clearTimeout(slideTimeout);

            if (transitionTimeout) {
                window.clearTimeout(transitionTimeout);
            }
        };
    }, [
        currentImage,
        firstImageLoaded,
        slides.length,
        onFinish,
    ]);

    const currentSlide = slides[currentImage];

    const nextSlide =
        currentImage < slides.length - 1
            ? slides[currentImage + 1]
            : currentSlide;

    const handleFirstImageLoad = () => {
        if (currentImage !== 0 || isTransitioning || firstImageLoaded) {
            return;
        }

        window.requestAnimationFrame(() => {
            setFirstImageLoaded(true);
        });
    };

    const handleFirstImageError = () => {
        if (currentImage === 0 && !isTransitioning) {
            setFirstImageLoaded(true);
        }
    };

    const renderTitle = title => {
        if (Array.isArray(title)) {
            return title.map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    {index < title.length - 1 && <br />}
                </React.Fragment>
            ));
        }

        return title;
    };

    const getTitleText = title =>
        Array.isArray(title) ? title.join(' ') : title;

    const isFirstImage = currentImage === 0 && !isTransitioning;

    const firstImageClass = isFirstImage
        ? firstImageLoaded
            ? 'main-carousel__image--initial'
            : 'main-carousel__image--waiting'
        : '';

    const mainImageKey = isFirstImage
        ? firstImageLoaded
            ? 'first-image-ready'
            : 'first-image-loading'
        : isTransitioning
          ? `in-${currentImage + 1}`
          : `current-${currentImage}`;

    return (
        <div className="main-carousel">
            <div className="main-carousel__image-container">
                {isTransitioning && (
                    <img
                        key={`out-${currentImage}`}
                        className="
                            main-carousel__image
                            main-carousel__image--out
                        "
                        src={currentSlide.image}
                        alt=""
                    />
                )}

                <img
                    ref={isFirstImage ? firstImageRef : null}
                    key={mainImageKey}
                    className={`
                        main-carousel__image
                        ${
                            isTransitioning
                                ? 'main-carousel__image--in'
                                : firstImageClass
                        }
                    `}
                    src={
                        isTransitioning
                            ? nextSlide.image
                            : currentSlide.image
                    }
                    alt={
                        currentSlide.title
                            ? getTitleText(currentSlide.title)
                            : 'Anton Gorbach'
                    }
                    onLoad={handleFirstImageLoad}
                    onError={handleFirstImageError}
                />
            </div>

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

            {!isTransitioning && currentSlide.title && (
                <div className="main-carousel__procedure">
                    <span data-text={getTitleText(currentSlide.title)}>
                        {renderTitle(currentSlide.title)}
                    </span>
                </div>
            )}

            {isTransitioning && currentSlide.title && (
                <div
                    className="
                        main-carousel__procedure
                        main-carousel__procedure--out
                    "
                >
                    <span data-text={getTitleText(currentSlide.title)}>
                        {renderTitle(currentSlide.title)}
                    </span>
                </div>
            )}

            {isTransitioning && nextSlide.title && (
                <div
                    className="
                        main-carousel__procedure
                        main-carousel__procedure--in
                    "
                >
                    <span data-text={getTitleText(nextSlide.title)}>
                        {renderTitle(nextSlide.title)}
                    </span>
                </div>
            )}

            {currentImage === 0 && !isTransitioning && (
                <div className="main-carousel__slide">
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
                </div>
            )}
        </div>
    );
};

export default Slider;