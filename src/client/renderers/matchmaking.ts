import { Renderer, cleanMain, CanvasRenderer } from ".";
import { socket } from "..";

export class Matchmaking implements Renderer {
    constructor(private updateRenderer: (renderer: Renderer) => void) { }

    async init() {
        const players = await this.getPlayers() || [];
        this.renderPlayers(players);
        socket.on('players-changed', (players: string[]) => {
            cleanMain();
            this.renderPlayers(players);
        });
        socket.on('invite-request', (player: string) => {
            if (window.confirm(`Join game with ${player}?`)) {
                // Join game
                this.updateRenderer(new CanvasRenderer());
                socket.emit('invite-accept', player);
            } else {
                // Do nothing
            }
        });
        socket.on('invite-accept', () => {
            this.updateRenderer(new CanvasRenderer());
        });
    }

    async getPlayers() {
        try {
            const response = await fetch('/api/players');
            return await response.json();
        } catch (e) {
            console.error(e);
        }
    }

    renderPlayers(players: string[]) {
        const main = document.getElementsByTagName('main')[0];
        for (let player of players) {
            if (player === socket.id) {
                // This is me
                continue;
            }
            const elem = document.createElement('button');
            elem.textContent = player;
            elem.className = 'player';
            elem.onclick = () => {
                socket.emit('invite-request', player);
            };
            main.appendChild(elem);
        }
    }

    clean() {
        cleanMain();
        socket.off('players-changed');
        socket.off('invite-request');
        socket.off('invite-accept');
    }
}