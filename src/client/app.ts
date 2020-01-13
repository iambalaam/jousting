import { Matchmaking } from "./renderers/matchmaking";
import { Renderer } from "./renderers";
import { Debug } from "./renderers/debug";
import { CreatePlayer } from "./renderers/create-player";

interface AppState {
    renderer: Renderer;
}

export class App {
    state: AppState;
    constructor() {
        const renderer = new URLSearchParams(window.location.search).has('forceDebug')
            ? new Debug(this.updateRenderer)
            : new CreatePlayer(this.updateRenderer);
        this.state = { renderer };
    }

    // TODO: type rendererConstructor properly
    updateRenderer = (rendererConstructor: any, options?: any) => {
        this.state.renderer.cleanActions.forEach((action) => {
            action();
        });
        this.state.renderer = new rendererConstructor(this.updateRenderer, options);
    };
}