import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./index";

export const backgroundFill = (ctx: CanvasRenderingContext2D, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}