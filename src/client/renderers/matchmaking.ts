import { Renderer, cleanMain, CanvasRenderer } from ".";
import { socket } from "..";

import './matchmaking.css';

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
            this.renderInvite(player);
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

    renderInvite(player: string) {
        const invite = document.createElement('div');
        invite.className = 'invite';

        const text = document.createElement('span');
        text.textContent = `Invite from ${player}`;

        const accept = document.createElement('button');
        accept.textContent = 'accept';
        accept.className = 'accept';
        accept.onclick = () => {
            this.updateRenderer(new CanvasRenderer());
            socket.emit('invite-accept', player);
        };

        const decline = document.createElement('button');
        decline.textContent = 'decline';
        decline.className = 'decline';
        decline.onclick = () => {
            this.cleanInvite(invite);
        };

        invite.appendChild(text);
        invite.appendChild(accept);
        invite.appendChild(decline);
        const main = document.getElementsByTagName('main')[0];
        main.appendChild(invite);
    }

    cleanInvite(inviteElem: HTMLElement) {
        const main = document.getElementsByTagName('main')[0];
        main.removeChild(inviteElem);
    }

    clean() {
        cleanMain();
        socket.off('players-changed');
        socket.off('invite-request');
        socket.off('invite-accept');
    }
}