import './index.css';
import { gameLoop } from './app';

declare const window: Window & { io: () => any; };
const socket = window.io();

const PLAYER_DIAMETER = 15;
const PLAYER_RADIUS = PLAYER_DIAMETER / 2;
const GRAVITY = 0.2;
const MAX_VAULT = 10;
const ACCELERATION = 0.3;
const MAX_SPEED = 6;
const SWORD_LENGTH = 20;
const FLOOR_HEIGHT = 100;
const BG_COLOR = [89, 124, 66];

// Setup <canvas/>
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const main = document.getElementsByTagName('main')[0];
const canvas = document.createElement('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
main.appendChild(canvas);
const canvasContext = canvas.getContext('2d');
if (!canvasContext) {
    throw new Error('Could not create canvas context');
}

const rafLoop: FrameRequestCallback = (time) => {
    gameLoop(canvasContext, time);
    window.requestAnimationFrame(rafLoop);
}
rafLoop(0);

export { CANVAS_WIDTH, CANVAS_HEIGHT, canvasContext };