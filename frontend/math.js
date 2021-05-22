"use strict";

class Matrix4x4 {
    constructor() {
        // setup identity matrix
        this.data = new Float32Array(16);
    }
    static identity() {
        const m = new Matrix4x4();
        m.data[0] = 1.0;
        m.data[5] = 1.0;
        m.data[10] = 1.0;
        m.data[15] = 1.0;
        return m;
    }
    static orthographic(left, right, bottom, top, nearClip, farClip) {
        const m = new Matrix4x4();
        const lr = 1.0 / (left - right);
        const bt = 1.0 / (bottom - top);
        const nf = 1.0 / (nearClip - farClip);

        m.data[0] = -2.0 * lr;
        m.data[5] = -2.0 * bt;
        m.data[10] = 2.0 * nf;
        m.data[12] = (left + right) * lr;
        m.data[13] = (top + bottom) * bt;
        m.data[14] = (farClip + nearClip) * bt;

        return m;
    }
}

