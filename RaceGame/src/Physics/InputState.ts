"use strict";

/**
 *  Input state values
 *  Range from 0.0-1.0
 */
class InputState {
    public left = 0;
    public right = 0;
    public throttle = 0;
    public brake = 0;
    public ebrake = 0;
    constructor() {

    }

    /**  Copy values from i to this */
    copy(i: any) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                (<any>this)[k] = i[k];
            }
        }
        return this;
    }

    /**  Set all to v (0.0-1.0) */
    set(v: number) {
        for (var k in this) {
            if (this.hasOwnProperty(k)) {
                (<any>this)[k] = v;
            }
        }
    }
}