"use strict";

const MAX_PLAYERS = 32 | 0;

class Players {
    constructor() {
        this.position = new Float32Array(2);
        this.velocity = new Float32Array(2);
        this.shaderProgram = null;
        this.playerLocations = new Float32Array(MAX_PLAYERS * 2 + 2);
        this.VBO = null;
        this.IBO = null;
    }
    initShaderProgram() {
        const vertexSrc = `
            attribute vec2 aVertexPosition;
            attribute vec2 playerTranslation;

            uniform mat4 projection;
            uniform vec2 worldTranslation;

            void main() {
                gl_Position = projection * vec4(aVertexPosition + playerTranslation - worldTranslation, -1.0, 1.0);
            }
        `;

        const fragmentSrc = `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
            }
        `;

        this.shaderProgram = gl.createProgram();
        const vertexShader = loadShader(gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentSrc);
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }
    genVertices(translation) {
        const vertices = new Float32Array([
            0.2,  0.2,
            0.2, -0.2,
            -0.2,  0.2,

            0.2, -0.2,
            -0.2, -0.2,
            -0.2,  0.2,
        ]);

        this.VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(0);

        this.IBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.IBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.playerLocations, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(1);
    }
    render(translation) {
        gl.useProgram(this.shaderProgram);
        const ortho = new Matrix4x4();
        ortho.orthographic(-canvas.clientWidth / 256 / devicePixelRatio, canvas.clientWidth / 256 / devicePixelRatio, -canvas.clientHeight / 256 / devicePixelRatio, canvas.clientHeight / 256 / devicePixelRatio, 0.1, 100.0)
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaderProgram, "projection"),
            false,
            ortho.data
        );
        this.playerLocations.set(translation.data);
        gl.uniform2fv(gl.getUniformLocation(this.shaderProgram, "worldTranslation"), translation.data);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.IBO);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.playerLocations);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(1);

        gl_ext.vertexAttribDivisorANGLE(1, 1);
        gl_ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, MAX_PLAYERS + 1);
        gl_ext.vertexAttribDivisorANGLE(1, 0);
    }
}
