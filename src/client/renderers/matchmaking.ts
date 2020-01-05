import { Renderer, cleanMain } from ".";
import { socket } from "..";

export class Matchmaking implements Renderer {
    async init() {
        const players = await this.getPlayers() || [];
        this.renderPlayers(players);
        socket.on('players-changed', (players: string[]) => {
            cleanMain();
            this.renderPlayers(players);
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
            const elem = document.createElement('div');
            elem.textContent = player;
            elem.className = 'player';
            main.appendChild(elem);
        }
    }

    clean() {
        cleanMain();
        socket.off('players-changed');
    }
}