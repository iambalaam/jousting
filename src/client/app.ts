import { Matchmaking } from "./renderers/matchmaking";
import { Renderer } from "./renderers";

interface AppState {
    renderer: Renderer;
}

export class App {
    state: AppState;
    constructor() {
        this.state = {
            renderer: new Matchmaking(this.updateRenderer)
        };
        this.state.renderer.init();
    }

    updateRenderer = (renderer: Renderer) => {
        this.state.renderer.clean();
        this.state.renderer = renderer;
        this.state.renderer.init();
    };
}