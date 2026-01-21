import React, { useState, useEffect } from 'react';
import RoomLobby from './RoomLobby';
import MultiplayerRoleReveal from './MultiplayerRoleReveal';
import MultiplayerGameBoard from './MultiplayerGameBoard';
import MultiplayerVoting from './MultiplayerVoting';
import MultiplayerEjection from './MultiplayerEjection';
import Results from './Results';
import { subscribeToRoom, resetRoom } from '../firebase';

export default function MultiplayerGame({ onBack }) {
    const [gamePhase, setGamePhase] = useState('LOBBY'); // LOBBY, REVEAL, PLAYING, VOTING
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState([]);
    const [gameData, setGameData] = useState(null);
    const [winner, setWinner] = useState(null);
    const [votes, setVotes] = useState(null);
    const [ejected, setEjected] = useState(null);
    const [lastEjected, setLastEjected] = useState(null);

    // Subscribe to room state changes
    useEffect(() => {
        if (!roomCode) return;

        console.log('Subscribing to room:', roomCode);
        const unsubscribe = subscribeToRoom(roomCode, (data) => {
            console.log('Room update received:', data?.gameState);
            if (!data) {
                // Room deleted
                setGamePhase('LOBBY');
                setRoomCode('');
                return;
            }

            // Sync game state
            if (data.gameState && data.gameState !== gamePhase) {
                console.log('Switching phase to:', data.gameState);
                setGamePhase(data.gameState);
            }
            if (data.players) {
                setPlayers(data.players);
            }
            if (data.gameData) {
                setGameData(data.gameData);
            }
            if (data.winner) {
                setWinner(data.winner);
            }
            if (data.votes) {
                setVotes(data.votes);
            }
            if (data.ejected) {
                setEjected(data.ejected);
            }
            if (data.lastEjected) {
                setLastEjected(data.lastEjected);
            }
        });

        return unsubscribe;
    }, [roomCode]);

    // Game start handler from RoomLobby
    const handleGameStart = (data) => {
        console.log('Game Starting! Received data:', data);
        setRoomCode(data.roomCode);
        setPlayers(data.players);
        setGameData(data.gameData);
        if (data.playerName) setPlayerName(data.playerName);
        // Force phase transition to ensure UI updates immediately (listener will take over)
        setGamePhase('REVEAL');
    };

    const handlePlayAgain = async () => {
        if (roomCode) {
            await resetRoom(roomCode);
        }
    };

    // Render based on phase
    switch (gamePhase) {
        case 'LOBBY':
            return (
                <RoomLobby
                    playerName={playerName}
                    onStartGame={handleGameStart}
                    onBack={onBack}
                    onPlayerNameChange={setPlayerName}
                />
            );

        case 'REVEAL':
            return (
                <MultiplayerRoleReveal
                    roomCode={roomCode}
                    playerName={playerName}
                    gameData={gameData}
                    players={players}
                />
            );

        case 'PLAYING':
            return (
                <MultiplayerGameBoard
                    roomCode={roomCode}
                    playerName={playerName}
                    gameData={gameData}
                    players={players}
                />
            );

        case 'VOTING':
            return (
                <MultiplayerVoting
                    roomCode={roomCode}
                    playerName={playerName}
                    gameData={gameData}
                    players={players}
                    ejected={ejected}
                />
            );

        case 'EJECTION':
            return (
                <MultiplayerEjection
                    roomCode={roomCode}
                    playerName={playerName}
                    gameData={gameData}
                    players={players}
                    lastEjected={lastEjected}
                    ejectedPlayers={ejected}
                />
            );

        case 'RESULTS':
            return (
                <Results
                    winner={winner}
                    gameData={gameData}
                    resetGame={handlePlayAgain}
                    votes={votes}
                    players={players}
                />
            );

        default:
            return (
                <RoomLobby
                    playerName={playerName}
                    onStartGame={handleGameStart}
                    onBack={onBack}
                    onPlayerNameChange={setPlayerName}
                />
            );
    }
}
