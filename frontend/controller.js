"use strict";

const KEY_UP = 1 | 0;
const KEY_RIGHT = 2 | 0;
const KEY_DOWN = 4 | 0;
const KEY_LEFT = 8 | 0;

class Input {
    constructor() {
        this.keyState = 0 | 0;
        this.lastTouchMovement = new Vector2(0.0, 0.0);
        this.movement = new Vector2(0.0, 0.0);
    }
    update() {
        this.movement.scale(0.0);

        if (this.keyState != 0) {
            const leftRight = ((this.keyState & KEY_RIGHT) >> 1) - ((this.keyState & KEY_LEFT) >> 3);
            const topDown = (this.keyState & KEY_UP) - ((this.keyState & KEY_DOWN) >> 2);
            this.movement.x = leftRight;
            this.movement.y = topDown;
            this.movement.normalize();
            return;
        }

        if (navigator.getGamepads) {
            const primaryGamepad = navigator.getGamepads()[0];
            if (primaryGamepad) {
                const gamepadVector = new Vector2(primaryGamepad.axes[0], -primaryGamepad.axes[1]);
                if (gamepadVector.magnitude() > 0.20) {
                    gamepadVector.normalize();
                    this.movement.add(gamepadVector);
                    return;
                }
            }
        }

        if (this.lastTouchMovement.x != 0.0 && this.lastTouchMovement.y != 0.0) {
            let relX = clamp(0.0, this.lastTouchMovement.x / window.innerWidth, 1.0);
            let relY = 1.0 - clamp(0.0, this.lastTouchMovement.y / window.innerHeight, 1.0) - 0.5;
            relX -= 0.5;
            const currentTouchMovement = new Vector2(relX, relY);
            currentTouchMovement.scale(2);
            currentTouchMovement.normalize();
            this.movement.add(currentTouchMovement);
            console.log(currentTouchMovement.x, currentTouchMovement.y);
            return;
        }
    }
}

const input = new Input();

window.onkeydown = (e) => {
    switch (e.keyCode) {
        case 87: // W Key
        case 38: // UP Arrow
            input.keyState |= KEY_UP; break;
        case 68: // D Key
        case 39: // Right Arrow
            input.keyState |= KEY_RIGHT; break;
        case 83: // S Key
        case 40: // Down Arrow
            input.keyState |= KEY_DOWN; break
        case 65: // A Key
        case 37: // Left Arrow
            input.keyState |= KEY_LEFT;
    }
}

window.onkeyup = (e) => {
    switch (e.keyCode) {
        case 87: // W Key
        case 38: // UP Arrow
            input.keyState &= ~KEY_UP; break;
        case 68: // D Key
        case 39: // Right Arrow
            input.keyState &= ~KEY_RIGHT; break;
        case 83: // S Key
        case 40: // Down Arrow
            input.keyState &= ~KEY_DOWN; break
        case 65: // A Key
        case 37: // Left Arrow
            input.keyState &= ~KEY_LEFT;
    }
}

window.ontouchstart = (e) => {
    input.lastTouchMovement.x = e.touches[0].clientX;
    input.lastTouchMovement.y = e.touches[0].clientY;
}
window.ontouchmove = (e) => {
    input.lastTouchMovement.x = e.touches[0].clientX;
    input.lastTouchMovement.y = e.touches[0].clientY;
}
window.ontouchend = () => {
    input.lastTouchMovement.x = 0.0;
    input.lastTouchMovement.y = 0.0;
}
