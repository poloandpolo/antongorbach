
import { useEffect, useState, useCallback } from 'react';
import {
    Routes,
    Route,
    useLocation,
} from 'react-router-dom';

import './App.scss';

import MainCarousel from './components/MainCarousel';
import BookingForm from './components/BookingForm';
import ProcedureGrid from './components/ProcedureGrid';
import Footer from './components/Footer';
import ArtistBio from './components/ArtistBio';
import CouponModal from './components/CouponModal';
import CouponButton from './components/CouponButton';
import CouponListModal from './components/CouponListModal';

import ProceduresEyeball from './pages/ProceduresEyeball';
import ProceduresScarification from './pages/ProceduresScarification';
import ProceduresTongueSplit from './pages/ProceduresToungeSplit';
import ProceduresSubdermalImplant from './pages/ProceduresSubdermalImplant';
import ProceduresTattoo from './pages/ProceduresTattoo';

import { COUPONS } from './data/coupons';

const CAROUSEL_STORAGE_KEY = 'anton-carousel-seen';
const PROCEDURE_STORAGE_KEY = 'procedureCouponsAssigned';
const EYEBALL_STORAGE_KEY = 'eyeballCouponAssignment';
const COUPON_TO_USE_KEY = 'couponToUse';
const COUPON_SEEN_PREFIX = 'couponSeen-';

// Lee JSON de forma segura.
function readJSON(key, storage = localStorage) {
    try {
        return JSON.parse(storage.getItem(key) || 'null');
    } catch {
        return null;
    }
}

// Migra datos existentes de sessionStorage a localStorage.
function migrateStorage(key) {
    const localValue = readJSON(key, localStorage);

    if (localValue !== null) {
        return localValue;
    }

    const sessionValue = readJSON(key, sessionStorage);

    if (sessionValue !== null) {
        localStorage.setItem(key, JSON.stringify(sessionValue));
        return sessionValue;
    }

    return null;
}

// Recupera una asignación de cupón, respetando su vencimiento.
function getCouponInfo(assignment) {
    if (!assignment?.code) return null;

    const catalogCoupon = COUPONS.find(
        coupon => coupon.code === assignment.code
    );

    if (!catalogCoupon) return null;

    if (
        assignment.expiresAt &&
        assignment.expiresAt <= Date.now()
    ) {
        return null;
    }

    return {
        ...catalogCoupon,
        title: catalogCoupon.title || catalogCoupon.procedure,
        assignedAt: assignment.assignedAt,
        expiresAt: assignment.expiresAt,
    };
}

// Asigna Eyeball una sola vez y persiste la asignación.
function assignEyeballCoupon() {
    const catalogCoupon = COUPONS.find(
        coupon => coupon.code === 'EYEBALL60'
    );

    if (!catalogCoupon) return null;

    let assignment = migrateStorage(EYEBALL_STORAGE_KEY);

    // Si ya fue asignado, no se crea otra asignación.
    if (assignment) {
        return getCouponInfo(assignment);
    }

    const now = Date.now();
    const expiration = new Date(now);

    expiration.setMonth(
        expiration.getMonth() + (catalogCoupon.validityMonths || 4)
    );

    assignment = {
        code: catalogCoupon.code,
        assignedAt: now,
        expiresAt: expiration.getTime(),
    };

    localStorage.setItem(
        EYEBALL_STORAGE_KEY,
        JSON.stringify(assignment)
    );

    return getCouponInfo(assignment);
}

// Devuelve los cupones asignados sin duplicar códigos.
function getAllAssignedCoupons() {
    const procedureAssignments =
        migrateStorage(PROCEDURE_STORAGE_KEY);

    const eyeballAssignment =
        migrateStorage(EYEBALL_STORAGE_KEY);

    const assignments = [
        ...(Array.isArray(procedureAssignments)
            ? procedureAssignments
            : []),
        ...(eyeballAssignment ? [eyeballAssignment] : []),
    ];

    const seen = new Set();

    return assignments
        .filter(assignment => {
            if (!assignment?.code || seen.has(assignment.code)) {
                return false;
            }

            seen.add(assignment.code);
            return true;
        })
        .map(getCouponInfo)
        .filter(Boolean);
}

function HomePage({ onCarouselFinish }) {
    const [showMain, setShowMain] = useState(
        () => localStorage.getItem(CAROUSEL_STORAGE_KEY) === 'true'
    );

    const [formCoupon, setFormCoupon] = useState(
        () =>
            localStorage.getItem(COUPON_TO_USE_KEY) ||
            sessionStorage.getItem(COUPON_TO_USE_KEY) ||
            ''
    );

    const location = useLocation();

    useEffect(() => {
        if (formCoupon) {
            localStorage.removeItem(COUPON_TO_USE_KEY);
            sessionStorage.removeItem(COUPON_TO_USE_KEY);
        }
    }, []);

    useEffect(() => {
        if (showMain) {
            localStorage.setItem(CAROUSEL_STORAGE_KEY, 'true');
            onCarouselFinish?.();
        }
    }, [showMain, onCarouselFinish]);

    useEffect(() => {
        const handleApplyCoupon = event => {
            if (event.detail) {
                setFormCoupon(event.detail);
            }
        };

        window.addEventListener('apply-coupon', handleApplyCoupon);

        return () => {
            window.removeEventListener(
                'apply-coupon',
                handleApplyCoupon
            );
        };
    }, []);

    useEffect(() => {
        if (location.state?.scrollToProcedures && showMain) {
            requestAnimationFrame(() => {
                document.getElementById('app_procedures')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            });
        }
    }, [location, showMain]);

    useEffect(() => {
        if (!showMain || !formCoupon) return;

        requestAnimationFrame(() => {
            document.getElementById('booking')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, [showMain, formCoupon]);

    const handleCarouselFinish = () => {
        localStorage.setItem(CAROUSEL_STORAGE_KEY, 'true');
        setShowMain(true);
        onCarouselFinish?.();
    };

    return (
        <main className={`app ${showMain ? 'app--main-visible' : ''}`}>
            {!showMain && (
                <div className="app__carousel">
                    <MainCarousel onFinish={handleCarouselFinish} />
                </div>
            )}

            <div className="app__main">
                <section id="booking" className="app__booking">
                    <BookingForm initialCoupon={formCoupon} />
                </section>

                <div className="app__background">
                    <section id="app_artist" className="app_artist">
                        <ArtistBio />
                    </section>

                    <section
                        id="app_procedures"
                        className="app_procedures"
                    >
                        <ProcedureGrid />
                    </section>
                </div>

                <Footer />
            </div>
        </main>
    );
}

function AppLayout() {
    const [showCouponList, setShowCouponList] = useState(false);
    const [assignedCoupons, setAssignedCoupons] = useState([]);

    const [eyeballCoupon, setEyeballCoupon] = useState(null);
    const [activeProcedureCoupon, setActiveProcedureCoupon] = useState(null);

    const [carouselFinished, setCarouselFinished] = useState(
        () => localStorage.getItem(CAROUSEL_STORAGE_KEY) === 'true'
    );

    const refreshCoupons = useCallback(() => {
        setAssignedCoupons(getAllAssignedCoupons());
    }, []);

    const handleCarouselFinish = useCallback(() => {
        localStorage.setItem(CAROUSEL_STORAGE_KEY, 'true');
        setCarouselFinished(true);
    }, []);

    useEffect(() => {
        const assignedEyeballCoupon = assignEyeballCoupon();

        refreshCoupons();

        if (assignedEyeballCoupon) {
            setEyeballCoupon(assignedEyeballCoupon);
        }

        const handleCouponsUpdated = event => {
            refreshCoupons();

            if (!event.detail?.code) return;

            const coupon = getCouponInfo(event.detail);

            if (!coupon) return;

            if (coupon.code === 'EYEBALL60') {
                setEyeballCoupon(previous => {
                    // Evita reiniciar el modal si la asignación no cambió.
                    if (
                        previous?.assignedAt === coupon.assignedAt &&
                        previous?.code === coupon.code
                    ) {
                        return previous;
                    }

                    return coupon;
                });
            } else {
                setActiveProcedureCoupon(coupon);
            }
        };

        const handleStorage = event => {
            if (
                event.key === PROCEDURE_STORAGE_KEY ||
                event.key === EYEBALL_STORAGE_KEY
            ) {
                refreshCoupons();

                const assignment = migrateStorage(EYEBALL_STORAGE_KEY);
                const coupon = getCouponInfo(assignment);

                if (coupon) {
                    setEyeballCoupon(coupon);
                }
            }
        };

        window.addEventListener(
            'coupons-updated',
            handleCouponsUpdated
        );

        window.addEventListener('storage', handleStorage);

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refreshCoupons();
            }
        };

        document.addEventListener(
            'visibilitychange',
            handleVisibility
        );

        return () => {
            window.removeEventListener(
                'coupons-updated',
                handleCouponsUpdated
            );

            window.removeEventListener('storage', handleStorage);

            document.removeEventListener(
                'visibilitychange',
                handleVisibility
            );
        };
    }, [refreshCoupons]);

    // Guardar el cupón y notificar al formulario sin cambiar de ruta.
    const handleUseCoupon = coupon => {
        if (!coupon?.code) return;

        localStorage.setItem(COUPON_TO_USE_KEY, coupon.code);
        sessionStorage.setItem(COUPON_TO_USE_KEY, coupon.code);

        window.dispatchEvent(
            new CustomEvent('apply-coupon', {
                detail: coupon.code,
            })
        );

        setShowCouponList(false);
    };

    // Cada modal usa una clave de almacenamiento persistente.
    const eyeballStorageKey = eyeballCoupon
        ? `${COUPON_SEEN_PREFIX}${eyeballCoupon.code}-${eyeballCoupon.assignedAt}`
        : null;

    const procedureStorageKey = activeProcedureCoupon
        ? `${COUPON_SEEN_PREFIX}${activeProcedureCoupon.code}-${activeProcedureCoupon.assignedAt}`
        : null;

    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            onCarouselFinish={handleCarouselFinish}
                        />
                    }
                />

                <Route
                    path="/procedures-eyeball"
                    element={<ProceduresEyeball />}
                />

                <Route
                    path="/procedures-scarification"
                    element={<ProceduresScarification />}
                />

                <Route
                    path="/procedures-tongue-split"
                    element={<ProceduresTongueSplit />}
                />

                <Route
                    path="/procedures-subdermal-implant"
                    element={<ProceduresSubdermalImplant />}
                />

                <Route
                    path="/procedures-tattoo"
                    element={<ProceduresTattoo />}
                />
            </Routes>

            {carouselFinished && (
                <CouponButton
                    count={assignedCoupons.length}
                    onClick={() => setShowCouponList(true)}
                />
            )}

            <CouponListModal
                isOpen={showCouponList}
                onClose={() => setShowCouponList(false)}
                coupons={assignedCoupons}
                onUseCoupon={handleUseCoupon}
            />

            {/* Modal de Eyeball: independiente de los cupones de procedimientos. */}
            {carouselFinished && eyeballCoupon && (
                <CouponModal
                    key={`eyeball-${eyeballCoupon.assignedAt}`}
                    procedure={eyeballCoupon.title}
                    discount={eyeballCoupon.discount}
                    image={eyeballCoupon.image}
                    code={eyeballCoupon.code}
                    expiresAt={eyeballCoupon.expiresAt}
                    storageKey={eyeballStorageKey}
                    delay={3000}
                />
            )}

            {/* Modal independiente para el cupón de procedimiento. */}
            {carouselFinished &&
                activeProcedureCoupon &&
                activeProcedureCoupon.code !== 'EYEBALL60' && (
                    <CouponModal
                        key={`procedure-${activeProcedureCoupon.code}-${activeProcedureCoupon.assignedAt}`}
                        procedure={activeProcedureCoupon.title}
                        discount={activeProcedureCoupon.discount}
                        image={activeProcedureCoupon.image}
                        code={activeProcedureCoupon.code}
                        expiresAt={activeProcedureCoupon.expiresAt}
                        storageKey={procedureStorageKey}
                        delay={0}
                    />
                )}
        </>
    );
}

export default function App() {
    return <AppLayout />;
}
