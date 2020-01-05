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
        socket.on('invite-request', (player: string) => {
            if (window.confirm(`Join game with ${player}?`)) {
                // Join game
                socket.emit('invite-accept', player);
            } else {
                // Do nothing
            }
        });
        socket.on('invite-accept', () => {
            console.log('accepted!');
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