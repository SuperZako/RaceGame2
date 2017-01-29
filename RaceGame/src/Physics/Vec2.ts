"use strict";

/**  Simple 2D Vector class */
class Vec2 {
    public constructor(public x = 0, public y = 0) {
        //this.x = x || 0.0;
        //this.y = y || 0.0;
    };

    //  Static methods
    static len(x: number, y: number) {
        return Math.sqrt(x * x + y * y);
    }

    static angle(x: number, y: number) {
        return Math.atan2(y, x);
    }

    //  Instance methods
    public set(x: number, y: number) {
        this.x = x; this.y = y;
    }

    public copy(v: Vec2) {
        this.x = v.x; this.y = v.y;
        return this;
    }

    public len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public dot(v: Vec2) {
        return this.x * v.x + this.y * v.y;
    }

    public det(v: Vec2) {
        return this.x * v.y - this.y * v.x;
    }

    public rotate(r: number) {
        var x = this.x,
            y = this.y,
            c = Math.cos(r),
            s = Math.sin(r);
        this.x = x * c - y * s;
        this.y = x * s + y * c;
    }

    public angle() {
        return Math.atan2(this.y, this.x);
    }

    public setLen(l: number) {
        var s = this.len();
        if (s > 0.0) {
            s = l / s;
            this.x *= s;
            this.y *= s;
        }
        else {
            this.x = l;
            this.y = 0.0;
        }
    }

    public normalize() {
        this.setLen(1.0);
    }
}
