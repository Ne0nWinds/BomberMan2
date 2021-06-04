"use strict";

const SIZE_OF_VERTEX = 4 | 0;
const SIZE_OF_INDEX = 6 | 0;
const MAP_MAX_X = 64 | 0;
const MAP_MAX_Y = 64 | 0;

class MapRenderer {
    constructor(x, y) {
        this.mapX = x;
        this.mapY = y;
        const size = (MAP_MAX_X * MAP_MAX_Y) | 0;
        this.intMap = new Uint8Array(size);
        this.vertices = new Float32Array(SIZE_OF_VERTEX * size * 4);
        this.indices = new Uint16Array(SIZE_OF_INDEX * size);
        this.shaderProgram = null;
        this.EBO = null;
        this.VBO = null;
        this.textureAtlas = null;
        this.mapTranslationUniformLocation = 0 | 0;
        this.mapTranslation = new Matrix4x4();
        this.mapTranslation.identity();
    }
    initShaderProgram() {
        const vertexSrc = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;

            varying vec2 vTextureCoord;

            uniform mat4 projection;
            uniform mat4 translation;

            void main() {
                gl_Position = projection * translation * vec4(aVertexPosition, -1.0, 1.0);
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
        this.shaderProgram = gl.createProgram();
        const vertexShader = loadShader(gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentSrc);
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.mapTranslationUniformLocation = gl.getUniformLocation(this.shaderProgram, "translation");
    }
    genVertices() {
        let loc = 0 | 0;
        const locIncrement = (SIZE_OF_VERTEX * 4) | 0;
        for (let y = 0 | 0; y < this.mapY; ++y) {
            for (let x = 0 | 0; x < this.mapX; ++x) {
                const intMapLoc = (y * this.mapX + x) | 0;
                this.vertices[loc + 0] = x + 1.0;
                this.vertices[loc + 1] = y + 1.0;
                this.vertices[loc + 2] = (this.intMap[intMapLoc] + 1) / 3 - (0.5 / 256);
                this.vertices[loc + 3] = 0.0;

                this.vertices[loc + 4] = x + 1.0;
                this.vertices[loc + 5] = y;
                this.vertices[loc + 6] = (this.intMap[intMapLoc] + 1) / 3 - (0.5 / 256);
                this.vertices[loc + 7] = 1.0;

                this.vertices[loc + 8] = x;
                this.vertices[loc + 9] = y;
                this.vertices[loc + 10] = (this.intMap[intMapLoc]) / 3;
                this.vertices[loc + 11] = 1.0;

                this.vertices[loc + 12] = x;
                this.vertices[loc + 13] = y + 1.0;
                this.vertices[loc + 14] = (this.intMap[intMapLoc]) / 3;
                this.vertices[loc + 15] = 0.0;

                loc += locIncrement;
            }
        }

        const indexArrayLength = ((this.indices.length) / SIZE_OF_INDEX) | 0;
        for (let i = 0 | 0; i < indexArrayLength; ++i) {
            const index = (i * 6) | 0;
            this.indices[index + 0] = 0 + i * 4;
            this.indices[index + 1] = 1 + i * 4;
            this.indices[index + 2] = 3 + i * 4;
            this.indices[index + 3] = 1 + i * 4;
            this.indices[index + 4] = 2 + i * 4;
            this.indices[index + 5] = 3 + i * 4;
        }

        this.VBO = gl.createBuffer();
        this.EBO = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
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
        gl.bindTexture(gl.TEXTURE_2D, this.textureAtlas);
        this.mapTranslation.translate(translation);
        gl.uniformMatrix4fv(this.mapTranslationUniformLocation, false, this.mapTranslation.data);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
        gl.enableVertexAttribArray(1);
        gl.drawElements(gl.TRIANGLES, 6 * (this.mapX * this.mapY), gl.UNSIGNED_SHORT, 0);
    }
}
