import { Loading } from "./loading";

let gameState = {
    renderer: new Loading()
}

export interface Renderer {
    draw(ctx: CanvasRenderingContext2D, time: number): void
}

export const gameLoop = (ctx: CanvasRenderingContext2D, time: number) => {
    gameState.renderer.draw(ctx, time);
}