"use strict";

/** @type HTMLCanvasElement */
const canvas = document.body.firstElementChild;
/** @type WebGL2RenderingContext */
const gl = canvas.getContext("webgl2");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.onresize = resizeCanvas;

function loadShader(type, src) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Shader Compilation Error!");
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

const shaderProgram = gl.createProgram();
{
    const vertexSrc = `
        attribute vec3 aVertexPosition;
        void main() {
            gl_Position = vec4(aVertexPosition, 1.0);
        }
    `;

    const fragmentSrc = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    gl.attachShader(shaderProgram, loadShader(gl.VERTEX_SHADER, vertexSrc));
    gl.attachShader(shaderProgram, loadShader(gl.FRAGMENT_SHADER, fragmentSrc));
    gl.linkProgram(shaderProgram);
}

const vertices = new Float32Array([
    0.5,  0.5, 0.0,  // top right
    0.5, -0.5, 0.0,  // bottom right
    -0.5, -0.5, 0.0,  // bottom left
    -0.5,  0.5, 0.0   // top left
]);
const indices = new Uint32Array([
    0, 1, 3,
    1, 2, 3
]);

const VBO = gl.createBuffer();
const EBO = gl.createBuffer();
const VAO = gl.createVertexArray();

gl.bindVertexArray(VAO);

gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);
gl.bindBuffer(gl.ARRAY_BUFFER, undefined);

gl.bindVertexArray(undefined);

const attribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");

const update = (delta) => { }
const render = (interp) => {
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgram);
    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
}
const engine = new Engine(update, render, 1000.0 / 120.0);
engine.start();
