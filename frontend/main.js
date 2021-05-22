"use strict";

const canvas = document.body.firstElementChild;
const gl = canvas.getContext("webgl2");

gl.clearColor(0.5, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
