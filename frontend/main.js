"use strict";

/** @type HTMLCanvasElement */
const canvas = document.body.firstElementChild;
/** @type WebGL2RenderingContext */
const gl = canvas.getContext("webgl2");

function resizeCanvas() {
    gl.useProgram(shaderProgram);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "projection"),
        false,
        Matrix4x4.orthographic(-canvas.clientWidth / 256 / devicePixelRatio, canvas.clientWidth / 256 / devicePixelRatio, -canvas.clientHeight / 256 / devicePixelRatio, canvas.clientHeight / 256 / devicePixelRatio, 0.1, 100.0)
    );
}
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

function loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    const img = new Image();
    img.src = url;
    img.onload = () => {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
    return texture;
}

const shaderProgram = gl.createProgram();
{
    const vertexSrc = `
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        varying vec2 vTextureCoord;

        uniform mat4 projection;
        uniform mat4 translation;

        void main() {
            gl_Position = projection * translation * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    const fragmentSrc = `
        precision mediump float;
        uniform sampler2D uSampler;
        varying vec2 vTextureCoord;
        void main() {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    `;

    gl.attachShader(shaderProgram, loadShader(gl.VERTEX_SHADER, vertexSrc));
    gl.attachShader(shaderProgram, loadShader(gl.FRAGMENT_SHADER, fragmentSrc));
    gl.linkProgram(shaderProgram);
}

const map = new Uint8Array(32 * 32);
for (let i = 0 | 0; i < 32; ++i) {
    for (let j = 0 | 0; j < 32; ++j) {
        map[i * 32 + j] = (i % 2 ^ j % 2);
    }
}

const vertices = new Float32Array(145 * 5 * 4);
for (let i = 0; i < vertices.length; i += 20) {
    const loc = Math.floor(i / 20);
    const y = Math.floor(loc / 15);
    const x = loc % 15;
    vertices[i + 0] = x + 1.0;
    vertices[i + 1] = y + 1.0;
    vertices[i + 2] = -1.0;
    vertices[i + 3] = 0.0;
    vertices[i + 4] = 0.0;

    vertices[i + 5] = x + 1.0;
    vertices[i + 6] = y;
    vertices[i + 7] = -1.0;
    vertices[i + 8] = 0.0;
    vertices[i + 9] = 1.0;

    vertices[i + 10] = x;
    vertices[i + 11] = y;
    vertices[i + 12] = -1.0;
    vertices[i + 13] = 1.0;
    vertices[i + 14] = 1.0;

    vertices[i + 15] = x;
    vertices[i + 16] = y + 1.0;
    vertices[i + 17] = -1.0;
    vertices[i + 18] = 1.0;
    vertices[i + 19] = 0.0;
}

const indices = new Uint32Array(145 * 6);
const baseIndices = new Uint32Array([0, 1, 3, 1, 2, 3]);
for (let i = 0 | 0; i < 145; ++i) {
    const index = i * 6;
    indices[index + 0] = baseIndices[0] + i * 4;
    indices[index + 1] = baseIndices[1] + i * 4;
    indices[index + 2] = baseIndices[2] + i * 4;
    indices[index + 3] = baseIndices[3] + i * 4;
    indices[index + 4] = baseIndices[4] + i * 4;
    indices[index + 5] = baseIndices[5] + i * 4;
}
// const vertices = new Float32Array([
//     1.0,    1.0, -1.0,      0.0, 0.0,
//     1.0,    -1.0, -1.0,     0.0, 1.0,
//     -1.0,   -1.0, -1.0,     1.0, 1.0,
//     -1.0,   1.0, -1.0,      1.0, 0.0,
// 
//     3.0,    3.0, -1.0,      0.0, 0.0,
//     3.0,    1.0, -1.0,      0.0, 1.0,
//     1.0,    1.0, -1.0,      1.0, 1.0,
//     1.0,    3.0, -1.0,      1.0, 0.0
// ]);
// const indices = new Uint32Array([
//     0, 1, 3,
//     1, 2, 3,
// 
//     4, 5, 7,
//     5, 6, 7,
//
//     8, 9, 11,
//     9, 10, 11,
// ]);

const texture = loadTexture("img/crate.png");

const VBO = gl.createBuffer();
const EBO = gl.createBuffer();
const VAO = gl.createVertexArray();

gl.bindVertexArray(VAO);

gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
gl.enableVertexAttribArray(0);

gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
gl.enableVertexAttribArray(1);

gl.bindBuffer(gl.ARRAY_BUFFER, undefined);

gl.bindVertexArray(undefined);

resizeCanvas();

const update = (delta) => {
    input.update();
}

const render = (interp) => {
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "translation"),
        false,
        Matrix4x4.translate(input.movement)
    );
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgram);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES, 6 * 145, gl.UNSIGNED_INT, 0);
}
const engine = new Engine(update, render, 1000.0 / 120.0);
engine.start();
    console.log("test");
