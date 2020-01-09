import { Matchmaking } from "./renderers/matchmaking";
import { Renderer } from "./renderers";
import { Debug } from "./renderers/debug";

interface AppState {
    renderer: Renderer;
}

export class App {
    state: AppState;
    constructor() {
        const renderer = new URLSearchParams(window.location.search).has('forceDebug')
            ? new Debug()
            : new Matchmaking(this.updateRenderer);
        this.state = { renderer };
        this.state.renderer.init();
    }

    updateRenderer = (renderer: Renderer) => {
        this.state.renderer.clean();
        this.state.renderer = renderer;
        this.state.renderer.init();
    };
}