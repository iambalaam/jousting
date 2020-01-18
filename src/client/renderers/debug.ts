import { CanvasRenderer, CANVAS_WIDTH, CANVAS_HEIGHT } from '.';

const spinnerRadius = 150;

export class Debug extends CanvasRenderer {
    time: number;
    constructor(_updateRenderer: (rendererConstructor: any, _opts: any) => void, _opts: any) {
        super();
        this.time = 0;
    }
    draw(ctx: CanvasRenderingContext2D, frameDuration: number) {
        this.time += frameDuration;

        // Fill the background
        ctx.fillStyle = 'indianred';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw a spinner
        ctx.beginPath();
        ctx.fillStyle = 'white';
        const circleX = (CANVAS_WIDTH / 2) + (spinnerRadius * Math.sin(this.time / 500));
        const circleY = (CANVAS_HEIGHT / 2) - (spinnerRadius * Math.cos(this.time / 500));
        ctx.ellipse(circleX, circleY, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}