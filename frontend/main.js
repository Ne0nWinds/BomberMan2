"use strict";

const WEBSOCKET_DOMAIN = "ws://192.168.0.23:8080"; // Only for local testing

const socket = new WebSocket(WEBSOCKET_DOMAIN);
let socketOpened = false;
socket.onopen = (e) => {
    socketOpened = true;
    socket.onmessage = async (e) => {
        let f = new Float32Array(await e.data.arrayBuffer());
        console.log(f);
    }
}

const mapRenderer = new MapRenderer(25, 25);
for (let i = 0 | 0; i < mapRenderer.mapY; ++i) {
    for (let j = 0 | 0; j < mapRenderer.mapX; ++j) {
        mapRenderer.intMap[i * mapRenderer.mapY + j] = (i & j) & 1;
    }
}
mapRenderer.textureAtlas = loadTexture("img/TextureAtlas.png");
mapRenderer.initShaderProgram();
mapRenderer.genVertices();

const players = new Players();
players.initShaderProgram();
players.genVertices();

const v2movement = new Vector2(0.0, 0.0);
const update = (delta) => {
    input.update();
    input.movement.scale(delta / 300);
    v2movement.add(input.movement);
}

const render = (interp) => {
    gl.clearColor(0.1, 0.1, 0.1, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    mapRenderer.render(v2movement);
    players.render();

    if (socketOpened) {
        socket.send(v2movement.data);
    }
}
const engine = new Engine(update, render, 1000.0 / 120.0);
engine.start();
