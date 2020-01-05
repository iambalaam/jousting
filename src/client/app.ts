import { Loading } from "./renderers/loading";
import { Matchmaking } from "./renderers/matchmaking";

let gameState = {
    renderer: new Loading()
}

export interface Renderer {
    draw(ctx: CanvasRenderingContext2D, time: number): void
}

export const gameLoop = (ctx: CanvasRenderingContext2D, time: number) => {
    gameState.renderer.draw(ctx, time);
}

setTimeout(() => { gameState.renderer = new Matchmaking() }, 3000)