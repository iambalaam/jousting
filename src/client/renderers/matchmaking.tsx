import * as React from 'jsx-dom';
import { Renderer, cleanMain } from ".";
import { socket } from "..";

import './matchmaking.css';
import { Game } from './game';
import { createPlayer, Players } from '../player';

export interface Player {
    id: string;
    name: string;
}

export const createGame = (playerIds: string[]): Players => {
    if (playerIds.length !== 2) {
        throw new Error('Only games of 2 players have been implemented');
    }
    const players: Players = {};
    players[playerIds[0]] = createPlayer({
        team: 'indianred',
        position: { x: 100, y: 400 }
    });
    players[playerIds[1]] = createPlayer({
        team: 'royalblue',
        position: { x: 700, y: 400 }
    });
    return players;
};

export class Matchmaking implements Renderer {
    cleanActions: Array<() => void>;
    constructor(private updateRenderer: (rendererConstructor: any, _opts: any) => void, _opts: any) {
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
        socket.on('invite-accept', (playerId: string) => {
            this.updateRenderer(Game, createGame([socket.id, playerId]));
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
                    this.updateRenderer(Game, createGame([player.id, socket.id]));
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