"use strict";

class Matrix4x4 {
    static identity() {
        const m = new Float32Array(16);
        m[0] = 1.0;
        m[5] = 1.0;
        m[10] = 1.0;
        m[15] = 1.0;
        return m;
    }
    static orthographic(left, right, bottom, top, nearClip, farClip) {
        const m = new Float32Array(16);
        m[0] = 2.0 / (right - left);
        m[5] = 2.0 / (top - bottom);
        m[10] = -2.0 / (farClip - nearClip);
        m[12] = -(right + left) / (right - left);
        m[13] = -(top + bottom) / (top - bottom);
        m[14] = -(farClip + nearClip) / (farClip - nearClip);
        m[15] = 1.0;
        return m;
    }
    static scale(scale) {
        const m = new Float32Array(16);
        m[0] = scale;
        m[5] = scale;
        m[10] = 1.0;
        m[15] = 1.0;
        return m;
    }
    static translate(x, y) {
        const m = this.identity();
        m[12] = x;
        m[13] = y;
        m[14] = -1;
        return m;
    }
}
