import { Matchmaking } from "./renderers/matchmaking";
import { Renderer } from "./renderers";

interface AppState {
    renderer: Renderer
}

export class App {
    state: AppState;
    constructor() {
        this.state = {
            renderer: new Matchmaking()
        }
        this.state.renderer.init();
    }
}