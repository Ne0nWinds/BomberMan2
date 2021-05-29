"use strict";

const MAX_PLAYERS = 16 | 0;

class NetworkedPlayer {
    constructor() {

    }
}

class LocalPlayer {
    constructor() {

    }
}

class Players {
    constructor() {
        this.position = new Float32Array(2);
        this.velocity = new Float32Array(2);
        this.shaderProgram = null;
        this.vertices = null;
        this.indices = null;
        this.VBO = null;
        this.EBO = null;
    }
    initShaderProgram() {
        const vertexSrc = `
            attribute vec2 aVertexPosition;

            uniform mat4 projection;

            void main() {
                gl_Position = projection * vec4(aVertexPosition, -1.0, 1.0);
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
    genVertices() {
        this.VBO = gl.createBuffer();
        this.EBO = gl.createBuffer();

        this.vertices = new Float32Array([
            0.2, 0.2,
            0.2, -0.2,
            -0.2, -0.2,
            -0.2, 0.2
        ]);
        this.indices = new Uint16Array([
            0, 1, 3,
            1, 2, 3
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);
    }
    render() {
        gl.useProgram(this.shaderProgram);
        const ortho = new Matrix4x4();
        ortho.orthographic(-canvas.clientWidth / 256 / devicePixelRatio, canvas.clientWidth / 256 / devicePixelRatio, -canvas.clientHeight / 256 / devicePixelRatio, canvas.clientHeight / 256 / devicePixelRatio, 0.1, 100.0)
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaderProgram, "projection"),
            false,
            ortho.data
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
        gl.enableVertexAttribArray(0);
        gl.drawElements(gl.TRIANGLES, 6 * 1, gl.UNSIGNED_SHORT, 0);
    }
}
