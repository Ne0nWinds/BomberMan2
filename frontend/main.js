"use strict";

const mapRenderer = new MapRenderer(25, 25);
for (let i = 0 | 0; i < mapRenderer.mapY; ++i) {
    for (let j = 0 | 0; j < mapRenderer.mapX; ++j) {
        mapRenderer.intMap[i * mapRenderer.mapY + j] = (i & j) & 1;
    }
}
mapRenderer.textureAtlas = loadTexture("img/TextureAtlas.png");
mapRenderer.initShaderProgram();
mapRenderer.genVertices();

const v2movement = new Vector2(0.0, 0.0);
const update = (delta) => {
    input.update();
    input.movement.scale((delta) * -1);
    input.movement.scale(0.01);
    v2movement.add(input.movement);
}

const render = (interp) => {
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mapRenderer.render(v2movement);
}
const engine = new Engine(update, render, 1000.0 / 120.0);
engine.start();
