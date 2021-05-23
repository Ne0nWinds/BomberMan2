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

        m.data[0] = 2.0 / (right - left);
        m.data[5] = 2.0 / (top - bottom);
        m.data[10] = -2.0 / (farClip - nearClip);
        m.data[12] = -(right + left) / (right - left);
        m.data[13] = -(top + bottom) / (top - bottom);
        m.data[14] = -(farClip + nearClip) / (farClip - nearClip);
        m.data[15] = 1.0;

        return m;
    }
}
