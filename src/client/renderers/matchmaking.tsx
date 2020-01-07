import * as React from 'jsx-dom';
import { Renderer, cleanMain } from ".";
import { socket } from "..";

import './matchmaking.css';
import { Game } from './game';

export class Matchmaking implements Renderer {
    constructor(private updateRenderer: (renderer: Renderer) => void) { }

    async init() {
        const players = await this.getPlayers() || [];
        this.renderPlayers(players);
        socket.on('players-changed', (players: string[]) => {
            this.updatePlayers(players);
        });
        socket.on('invite-request', (player: string) => {
            this.renderInvite(player);
        });
        socket.on('invite-accept', () => {
            this.updateRenderer(new Game());
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

    renderPlayers(players: string[]) {
        const main = document.getElementsByTagName('main')[0];
        const playerList = (
            <div className="playerlist">{
                players
                    // Filter oneself out
                    .filter((player) => player !== socket.id)
                    .map((player) =>
                        <button
                            className='player'
                            onClick={() => { socket.emit('invite-request', player); }}
                        >{player} 📥</button>)
            }</div>
        );
        main.appendChild(playerList);
    }

    renderInvite(player: string) {
        const invite = (
            <div className="invite">
                <span>Invite from:</span>
                <span class="playername">{player}</span>
                <button className="accept" onClick={() => {
                    this.updateRenderer(new Game());
                    socket.emit('invite-accept', player);
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

    updatePlayers(players: string[]) {
        const main = document.getElementsByTagName('main')[0];
        const playerList = main.getElementsByClassName('playerlist')[0];
        main.removeChild(playerList);
        this.renderPlayers(players);
    }

    clean() {
        cleanMain();
        socket.off('players-changed');
        socket.off('invite-request');
        socket.off('invite-accept');
    }
}