import { socket } from "..";

export interface Renderer {
    /**
     * This is responsible for taking control of the <main/> tag
     * It will also need to rAF in a loop
     */
    init(): void;

    /**
     * This should remove all event listeners and clean the <main/> tag
     */
    clean(): void;
}

export const cleanMain = () => {
    const main = document.getElementsByTagName('main')[0];
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
};

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;

export class CanvasRenderer implements Renderer {
    rAFLoop: boolean;
    debug: boolean;
    lastTime: number;
    ping?: number;
    constructor() {
        this.rAFLoop = true;
        const params = new URLSearchParams(window.location.search);
        this.debug = params.has('debug') || params.has('forceDebug');
        if (this.debug) {
            socket.on('debug-pong', (time: number) => {
                this.ping = (Date.now() - time) / 2;
                socket.emit('debug-ping', Date.now());
            });
            socket.emit('debug-ping', Date.now());
        }
        this.lastTime = 0;
    }

    init() {
        const ctx = this.createCanvas();
        this.drawLoop(ctx)(0);
    }

    createCanvas(): CanvasRenderingContext2D {
        const main = document.getElementsByTagName('main')[0];
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        main.appendChild(canvas);
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
            throw new Error('Could not create canvas context');
        }
        return canvasContext;
    }

    drawLoop = (ctx: CanvasRenderingContext2D): FrameRequestCallback => {
        return (time) => {
            this.draw(ctx, time);
            this.debug && this.drawDebug(ctx, time);
            if (this.debug) {

            }
            if (this.rAFLoop) {
                window.requestAnimationFrame(this.drawLoop(ctx));
            }
        };
    };

    /**
     * Callback for rAF, draws a single frame
     */
    draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.fillStyle = 'indianred';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawDebug(ctx: CanvasRenderingContext2D, time: number) {
        ctx.fillStyle = 'black';
        ctx.font = '20px sans-serif';
        // FPS
        const frameDuration = time - this.lastTime;
        if (frameDuration) {
            const fps = (1000 / frameDuration);
            ctx.fillText(`fps: ${fps.toFixed(0)}`, 20, 20);
        }
        this.lastTime = time;
        // PING
        if (this.ping) {
            ctx.fillText(`ping: ${this.ping.toFixed(0)}`, 20, 40);
        }
    }

    clean() {
        this.rAFLoop = false;
        socket.off('debug-pong');
        cleanMain();
    }
};