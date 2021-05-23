"use strict";

/** @type HTMLCanvasElement */
const canvas = document.body.firstElementChild;
/** @type WebGL2RenderingContext */
const gl = canvas.getContext("webgl2");

function resizeCanvas() {
    gl.useProgram(shaderProgram);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "projection"),
        false,
        Matrix4x4.orthographic(-canvas.width / 128, canvas.width / 128, -canvas.height / 128, canvas.height / 128, 0.1, 100.0),
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

function loadTexture(img) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

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

const vertices = new Float32Array([
    1.0,  1.0, -1.0,     0.0, 0.0,
    1.0, -1.0, -1.0,     0.0, 1.0,
    -1.0, -1.0, -1.0,    1.0, 1.0,
    -1.0,  1.0, -1.0,    1.0, 0.0
]);
const indices = new Uint32Array([
    0, 1, 3,
    1, 2, 3,
]);

const texture = loadTexture(document.getElementsByTagName('img')[0]);

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

}
const render = (interp) => {
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "translation"),
        false,
        Matrix4x4.translate(3, 3)
    );
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgram);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
}
const engine = new Engine(update, render, 1000.0 / 120.0);
engine.start();
