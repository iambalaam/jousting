import { Matchmaking } from "./renderers/matchmaking";
import { Renderer } from "./renderers";
import { Debug } from "./renderers/debug";
import { CreatePlayer } from "./renderers/create-player";

interface AppState {
    renderer: Renderer;
}

export const setUsername = async (playerId: string, username: string) => {
    return await fetch('/api/setUsername', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ playerId, username })
    });
};

export class App {
    state?: AppState;
    socket: any;
    constructor(socket: any) {
        this.socket = socket;
    }

    async init() {
        let renderer: Renderer;
        const isDebug = new URLSearchParams(window.location.search).has('forceDebug');
        const username = window.localStorage.getItem('username');

        if (isDebug) {
            renderer = new Debug(this.updateRenderer, {});
            this.state = { renderer };
            return;
        }

        if (username) {
            let response;
            try {
                response = await setUsername(this.socket.id, username);
            } catch (e) {
                // handled below
            }
            if (response && response.ok) {
                renderer = new Matchmaking(this.updateRenderer, { username });
                this.state = { renderer };
                return;
            }
        }

        renderer = new CreatePlayer(this.updateRenderer, {});
        this.state = { renderer };
        return;
    }

    // TODO: type rendererConstructor properly
    updateRenderer = (rendererConstructor: any, options?: any) => {
        if (this.state) {
            this.state.renderer.cleanActions.forEach((action) => {
                action();
            });
            this.state.renderer = new rendererConstructor(this.updateRenderer, options);
        }
    };
}