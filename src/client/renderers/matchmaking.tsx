import * as React from 'jsx-dom';
import { Renderer, cleanMain } from ".";
import { socket } from "..";

import './matchmaking.css';
import { Game } from './game';

export interface Player {
    id: string;
    name: string;
}

export class Matchmaking implements Renderer {
    cleanActions: Array<() => void>;
    constructor(private updateRenderer: (rendererConstructor: any) => void) {
        this.cleanActions = [() => {
            socket.off('players-changed');
            socket.off('invite-request');
            socket.off('invite-accept');
            cleanMain();
        }];
        this.init();
    }

    async init() {
        const players = await this.getPlayers() || [];
        this.renderPlayers(players);
        socket.on('players-changed', (players: Player[]) => {
            this.updatePlayers(players);
        });
        socket.on('invite-request', (player: Player) => {
            this.renderInvite(player);
        });
        socket.on('invite-accept', () => {
            this.updateRenderer(Game);
        });
    }

    async getPlayers() {
        try {
            const response = await fetch('/api/matchmaking');
            return await response.json();
        } catch (e) {
            console.error(e);
        }
    }

    renderPlayers(players: Array<Player>) {
        const main = document.getElementsByTagName('main')[0];
        const playerList = (
            <div className="playerlist">{
                players
                    // Filter oneself out
                    .filter((player) => player.id !== socket.id)
                    .map((player) =>
                        <button
                            className='player'
                            onClick={() => { socket.emit('invite-request', player.id); }}
                        >{player.name || player.id} 📥</button>)
            }</div>
        );
        main.appendChild(playerList);
    }

    renderInvite(player: Player) {
        const invite = (
            <div className="invite">
                <span>Invite from:</span>
                <span class="playername">{player.name || player.id}</span>
                <button className="accept" onClick={() => {
                    this.updateRenderer(Game);
                    socket.emit('invite-accept', player.id);
                }}>accept</button>
                <button className="decline" onClick={() => {
                    this.cleanInvite(invite);
                }}>decline</button>
            </div>
        );

        const main = document.getElementsByTagName('main')[0];
        main.appendChild(invite);
    }

    cleanInvite(inviteElem: HTMLElement) {
        const main = document.getElementsByTagName('main')[0];
        main.removeChild(inviteElem);
    }

    updatePlayers(players: Player[]) {
        const main = document.getElementsByTagName('main')[0];
        const playerList = main.getElementsByClassName('playerlist')[0];
        main.removeChild(playerList);
        this.renderPlayers(players);
    }
}