import { useEffect, useState } from 'react';

const STORAGE_KEY = 'procedureCouponsAssigned';
const MAX_PROCEDURE_COUPONS = 3;
const DELAY = 10_000;

function readCoupons() {
    try {
        const localData = localStorage.getItem(STORAGE_KEY);

        if (localData !== null) {
            const parsed = JSON.parse(localData);
            return Array.isArray(parsed) ? parsed : [];
        }

        // Migrar las asignaciones antiguas de sessionStorage.
        const sessionData = sessionStorage.getItem(STORAGE_KEY);

        if (sessionData !== null) {
            const parsed = JSON.parse(sessionData);
            const coupons = Array.isArray(parsed) ? parsed : [];

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(coupons)
            );

            return coupons;
        }

        return [];
    } catch (error) {
        console.error(
            'Error al leer los cupones de procedimientos:',
            error
        );

        return [];
    }
}

function writeCoupons(coupons) {
    const serialized = JSON.stringify(coupons);

    // Persistencia principal.
    localStorage.setItem(STORAGE_KEY, serialized);

    // Compatibilidad con componentes que todavía consulten sessionStorage.
    sessionStorage.setItem(STORAGE_KEY, serialized);
}

function notifyCouponsUpdated(coupon = null) {
    window.dispatchEvent(
        new CustomEvent('coupons-updated', {
            detail: coupon,
        })
    );
}

export default function useProcedureCoupon(
    pathname,
    couponCode,
    validityMonths
) {
    const [coupon, setCoupon] = useState('');

    useEffect(() => {
        let cancelled = false;

        setCoupon('');

        if (
            !pathname ||
            !couponCode ||
            couponCode === 'EYEBALL60' ||
            !Number.isFinite(validityMonths) ||
            validityMonths <= 0
        ) {
            return undefined;
        }

        const existingCoupons = readCoupons();

        // Evitar duplicados para la misma página.
        const existing = existingCoupons.find(
            (item) => item.path === pathname
        );

        if (existing) {
            if (
                existing.code === couponCode &&
                Number(existing.expiresAt) > Date.now()
            ) {
                setCoupon(existing.code);
            }

            return undefined;
        }

        // El cupón de Eyeball no ocupa un espacio de procedimiento.
        const activeProcedureCoupons = existingCoupons.filter(
            (item) =>
                item.code !== 'EYEBALL60' &&
                Number(item.expiresAt) > Date.now()
        );

        if (activeProcedureCoupons.length >= MAX_PROCEDURE_COUPONS) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            if (cancelled) return;

            try {
                // Volver a leer antes de escribir para reducir duplicados.
                const currentCoupons = readCoupons();

                const existingPath = currentCoupons.find(
                    (item) => item.path === pathname
                );

                if (existingPath) {
                    if (
                        existingPath.code === couponCode &&
                        Number(existingPath.expiresAt) > Date.now()
                    ) {
                        setCoupon(existingPath.code);
                    }

                    return;
                }

                const activeCoupons = currentCoupons.filter(
                    (item) =>
                        item.code !== 'EYEBALL60' &&
                        Number(item.expiresAt) > Date.now()
                );

                if (
                    activeCoupons.length >= MAX_PROCEDURE_COUPONS
                ) {
                    return;
                }

                const now = Date.now();
                const expiration = new Date(now);

                expiration.setMonth(
                    expiration.getMonth() + validityMonths
                );

                const newCoupon = {
                    path: pathname,
                    code: couponCode,
                    assignedAt: now,
                    expiresAt: expiration.getTime(),
                };

                const updatedCoupons = [
                    ...currentCoupons,
                    newCoupon,
                ];

                // Guardar antes de actualizar el estado y notificar.
                writeCoupons(updatedCoupons);

                setCoupon(couponCode);

                // App.jsx recibe la nueva asignación.
                notifyCouponsUpdated(newCoupon);
            } catch (error) {
                console.error(
                    `No se pudo guardar el cupón ${couponCode}:`,
                    error
                );
            }
        }, DELAY);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [pathname, couponCode, validityMonths]);

    return coupon;
}