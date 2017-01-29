"use strict";

/**  Useful Game Math stuff */
namespace GMath {
    export function sign(n: number) {
        //  Allegedly fastest if we check for number type
        //return typeof n === 'number' ? n ? n < 0 ? -1 : 1 : n === n ? 0 : NaN : NaN;
        return n < 0 ? -1 : 1;
    }

    export function clamp(n: number, min: number, max: number) {
        return Math.min(Math.max(n, min), max);
    }

    /**  Always positive modulus */
    export function pmod(n: number, m: number) {
        return (n % m + m) % m;
    }
};
