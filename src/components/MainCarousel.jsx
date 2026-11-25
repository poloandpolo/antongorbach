import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import '../components/styles/MainCarousel.scss';

import Anton_1_mobile from '../../Images/Maincarrousel/Anton_1_mobile.jpeg';
import Anton_1_desktop from '../../Images/Maincarrousel/Anton_1_desktop.png';
import Eyeball from '../../Images/Maincarrousel/Eyeball.jpeg';
import Scar from '../../Images/Maincarrousel/Scar.jpeg';
import Implant from '../../Images/Maincarrousel/Implant.jpeg';
import Tongue from '../../Images/Maincarrousel/Tongue.jpeg';
import Tattoo from '../../Images/Maincarrousel/Tattoo.jpeg';

function preloadAndDecode(src) {
    return new Promise(resolve => {
        const image = new Image();
        let settled = false;

        const finish = async () => {
            if (settled) return;
            settled = true;

            try {
                if (typeof image.decode === 'function') {
                    await image.decode();
                }
            } catch {
                // Si decode no está disponible o falla, no bloqueamos el carrusel.
            }

            resolve(src);
        };

        image.onload = finish;
        image.onerror = () => {
            if (settled) return;
            settled = true;
            resolve(src);
        };

        image.src = src;

        // Cubre el caso de una imagen que ya estaba en caché.
        if (image.complete && image.naturalWidth > 0) {
            finish();
        }
    });
}

const Slider = ({ onFinish }) => {
    const firstImageRef = useRef(null);

    const [isDesktop, setIsDesktop] = useState(() =>
        window.matchMedia('(min-width: 769px)').matches
    );
    const [currentImage, setCurrentImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [firstImageLoaded, setFirstImageLoaded] = useState(false);
    const [loadedImages, setLoadedImages] = useState(() => new Set());

    const slides = useMemo(
        () => [
            {
                image: isDesktop ? Anton_1_desktop : Anton_1_mobile,
                title: null,
            },
            { image: Eyeball, title: 'Eyeball Tattoo' },
            { image: Scar, title: 'Scarification' },
            { image: Tongue, title: 'Tongue Split' },
            { image: Implant, title: ['Subdermal', 'Implant'] },
            { image: Tattoo, title: 'Tattoo' },
        ],
        [isDesktop]
    );

    const markImageLoaded = useCallback(src => {
        setLoadedImages(previous => {
            if (previous.has(src)) return previous;

            const next = new Set(previous);
            next.add(src);
            return next;
        });
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 769px)');
        const handleChange = event => setIsDesktop(event.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Detecta la primera imagen incluso si el navegador ya la tenía en caché.
    useEffect(() => {
        if (currentImage !== 0 || isTransitioning || firstImageLoaded) {
            return undefined;
        }

        const image = firstImageRef.current;

        if (!image?.complete || image.naturalWidth === 0) {
            return undefined;
        }

        let cancelled = false;

        const markReady = () => {
            if (cancelled) return;

            markImageLoaded(slides[0].image);
            setFirstImageLoaded(true);
        };

        if (typeof image.decode === 'function') {
            image.decode().catch(() => {}).then(markReady);
        } else {
            markReady();
        }

        return () => {
            cancelled = true;
        };
    }, [
        currentImage,
        firstImageLoaded,
        isTransitioning,
        isDesktop,
        markImageLoaded,
        slides,
    ]);

    // La primera foto se prioriza; después se precargan las demás.
    useEffect(() => {
        if (!firstImageLoaded) return undefined;

        let cancelled = false;

        const remainingSources = [
            ...new Set(slides.slice(1).map(slide => slide.image)),
        ];

        Promise.all(remainingSources.map(preloadAndDecode)).then(sources => {
            if (cancelled) return;

            setLoadedImages(previous => {
                const next = new Set(previous);
                sources.forEach(src => next.add(src));
                return next;
            });
        });

        return () => {
            cancelled = true;
        };
    }, [firstImageLoaded, slides]);

    useEffect(() => {
        if (currentImage === 0 && !firstImageLoaded) {
            return undefined;
        }

        const isLastSlide = currentImage === slides.length - 1;
        const nextSlide = slides[currentImage + 1];

        // No comienza la transición hasta que la imagen siguiente esté decodificada.
        if (!isLastSlide && !loadedImages.has(nextSlide.image)) {
            return undefined;
        }

        const firstSlideDuration = 2900;
        const slideDuration = 900;
        const transitionDuration = 800;

        if (isLastSlide) {
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
        loadedImages,
        slides,
        onFinish,
    ]);

    const currentSlide = slides[currentImage];

    const nextSlide =
        currentImage < slides.length - 1
            ? slides[currentImage + 1]
            : currentSlide;

    const handleImageLoad = async (src, event) => {
        const image = event.currentTarget;

        try {
            if (typeof image.decode === 'function') {
                await image.decode();
            }
        } catch {
            // La imagen ya terminó de cargar; seguimos aunque decode falle.
        }

        markImageLoaded(src);

        if (src === slides[0].image && currentImage === 0) {
            setFirstImageLoaded(true);
        }
    };

    const handleImageError = src => {
        markImageLoaded(src);

        if (src === slides[0].image && currentImage === 0) {
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
                    loading={isFirstImage ? 'eager' : 'lazy'}
                    fetchPriority={isFirstImage ? 'high' : 'auto'}
                    decoding="async"
                    onLoad={event =>
                        handleImageLoad(currentSlide.image, event)
                    }
                    onError={() => handleImageError(currentSlide.image)}
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