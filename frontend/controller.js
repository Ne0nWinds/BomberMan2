"use strict";

const KEY_UP = 1 | 0;
const KEY_RIGHT = 2 | 0;
const KEY_DOWN = 4 | 0;
const KEY_LEFT = 8 | 0;

const GAMEPAD_DEADZONE = 0.20 * 0.20;

// TODO: Adjust deadzoning for gamepad / touch input

class Input {
    constructor() {
        this.buttons = 0 | 0;
        this.lastTouchMovement = new Vector2(0.0, 0.0);
        this.movement = new Vector2(0.0, 0.0);
    }
    update() {
        this.movement.x = this.movement.y = 0.0;

        if ((this.buttons & (KEY_UP + KEY_RIGHT + KEY_DOWN + KEY_LEFT)) != 0) {
            const leftRight = ((this.buttons & KEY_RIGHT) >> 1) - ((this.buttons & KEY_LEFT) >> 3);
            const topDown = (this.buttons & KEY_UP) - ((this.buttons & KEY_DOWN) >> 2);
            this.movement.x = leftRight;
            this.movement.y = topDown;
            if (leftRight | topDown != 0)
                this.movement.normalize();
            return;
        }

        if (navigator.getGamepads) {
            const primaryGamepad = navigator.getGamepads()[0];
            if (primaryGamepad) {
                const gamepadVector = new Vector2(primaryGamepad.axes[0], -primaryGamepad.axes[1]);
                if (gamepadVector.magnitudeSquared() < GAMEPAD_DEADZONE) {
                    gamepadVector.x = primaryGamepad.axes[2];
                    gamepadVector.y = -primaryGamepad.axes[3];
                }
                if (gamepadVector.magnitudeSquared() < GAMEPAD_DEADZONE) {
                    gamepadVector.x = primaryGamepad.buttons[15].value - primaryGamepad.buttons[14].value;
                    gamepadVector.y = primaryGamepad.buttons[12].value - primaryGamepad.buttons[13].value;
                }
                if (gamepadVector.magnitudeSquared() > GAMEPAD_DEADZONE) {
                    if (gamepadVector.magnitudeSquared() > 1)
                        gamepadVector.normalize();
                    this.movement.add(gamepadVector);
                    return;
                }
            }
        }

        if (this.lastTouchMovement.x != 0.0 && this.lastTouchMovement.y != 0.0) {
            let relX = clamp(0.0, this.lastTouchMovement.x / window.innerWidth, 1.0);
            let relY = 1.0 - clamp(0.0, this.lastTouchMovement.y / window.innerHeight, 1.0);
            const currentTouchMovement = new Vector2(relX, relY);
            currentTouchMovement.scale(2);
            currentTouchMovement.x -= 1;
            currentTouchMovement.y -= 1;
            if (currentTouchMovement.magnitudeSquared() > 1) {
                currentTouchMovement.normalize();
            }
            this.movement.add(currentTouchMovement);
            return;
        }
    }
}

const input = new Input();

window.onkeydown = (e) => {
    switch (e.keyCode) {
        case 87: // W Key
        case 38: // UP Arrow
            input.buttons |= KEY_UP; break;
        case 68: // D Key
        case 39: // Right Arrow
            input.buttons |= KEY_RIGHT; break;
        case 83: // S Key
        case 40: // Down Arrow
            input.buttons |= KEY_DOWN; break
        case 65: // A Key
        case 37: // Left Arrow
            input.buttons |= KEY_LEFT;
    }
}
window.onkeyup = (e) => {
    switch (e.keyCode) {
        case 87: // W Key
        case 38: // Up Arrow
            input.buttons &= ~KEY_UP; break;
        case 68: // D Key
        case 39: // Right Arrow
            input.buttons &= ~KEY_RIGHT; break;
        case 83: // S Key
        case 40: // Down Arrow
            input.buttons &= ~KEY_DOWN; break
        case 65: // A Key
        case 37: // Left Arrow
            input.buttons &= ~KEY_LEFT;
    }
}

window.ontouchstart = window.ontouchmove = (e) => {
    e.preventDefault();
    input.lastTouchMovement.x = e.touches[0].clientX;
    input.lastTouchMovement.y = e.touches[0].clientY;
}
window.ontouchend = (e) => {
    e.preventDefault();
    input.lastTouchMovement.x = 0.0;
    input.lastTouchMovement.y = 0.0;
}
window.ontouchcancel = (e) => {
    e.preventDefault();
    input.lastTouchMovement.x = 0.0;
    input.lastTouchMovement.y = 0.0;
}
