"use strict";

class Matrix4x4 {
    constructor() {
        this.data = new Float32Array(16);
    }
    identity() {
        this.data[0] = 1.0;
        this.data[5] = 1.0;
        this.data[10] = 1.0;
        this.data[15] = 1.0;
    }
    orthographic(left, right, bottom, top, nearClip, farClip) {
        this.data[0] = 2.0 / (right - left);
        this.data[5] = 2.0 / (top - bottom);
        this.data[10] = -2.0 / (farClip - nearClip);
        this.data[12] = -(right + left) / (right - left);
        this.data[13] = -(top + bottom) / (top - bottom);
        this.data[14] = -(farClip + nearClip) / (farClip - nearClip);
        this.data[15] = 1.0;
    }
    scale(scale) {
        this.data[0] = scale;
        this.data[5] = scale;
        this.data[10] = 1.0;
        this.data[15] = 1.0;
    }
    translate(v2) {
        this.data[12] = v2.x;
        this.data[13] = v2.y;
        this.data[14] = -1;
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
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    normalize() {
        const m = this.magnitude();
        this.scale(1 / m);
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

function clamp(min, val, max) {
    if (val < min) val = min;
    if (val > max) val = max;
    return val;
}
