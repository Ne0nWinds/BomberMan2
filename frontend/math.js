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
    static translate(v2) {
        const m = this.identity();
        m[12] = v2.x;
        m[13] = v2.y;
        m[14] = -1;
        return m;
    }
}

class Vector2 {
    constructor(x, y) {
        this.data = new Float32Array(2);
        this.data[0] = x;
        this.data[1] = y;
    }
    get x() {
        return this.data[0];
    }
    get y() {
        return this.data[1];
    }
    set x(value) {
        this.data[0] = value;
    }
    set y(value) {
        this.data[1] = value;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const m = this.magnitude();
        this.scale(m);
    }
    scale(s) {
        this.x *= s;
        this.y *= s;
    }
    div(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
    }
    mul(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
    }
    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }
    sub(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    }
}
