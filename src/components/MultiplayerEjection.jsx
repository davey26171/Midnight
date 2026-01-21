import React, { useEffect, useState } from 'react';
import { Skull, UserX } from 'lucide-react';
import { setWinner, updateGamePhase, clearVotes } from '../firebase';

export default function MultiplayerEjection({ roomCode, playerName, gameData, players, lastEjected, ejectedPlayers }) {
    const [message, setMessage] = useState('');
    const [subMessage, setSubMessage] = useState('');
    const [isSpy, setIsSpy] = useState(false);

    // Host Logic: Check win condition and transition
    useEffect(() => {
        if (!gameData || !players || !lastEjected) return;

        const wasSpy = gameData.spies?.includes(lastEjected);
        setIsSpy(wasSpy);

        // Calculate remaining spies
        const totalSpies = gameData.spies.length;
        const caughtSpies = gameData.spies.filter(s => ejectedPlayers && ejectedPlayers[s]).length; // Use current ejected list
        // Note: ejectedPlayers includes lastEjected already? Yes, firebase update does both.
        // Wait, props updates might lag. We assume lastEjected is IN ejectedPlayers, or we treat it as such.

        let actuallyCaught = caughtSpies;
        if (ejectedPlayers && !ejectedPlayers[lastEjected]) {
            // If local state hasn't updated yet to include current ejectee
            if (wasSpy) actuallyCaught++;
        } else if (!ejectedPlayers) {
            if (wasSpy) actuallyCaught = 1;
        }

        const remainingSpies = totalSpies - actuallyCaught;

        // Display Messages
        if (lastEjected === 'SKIP') {
            setMessage('No one was ejected (Skipped)');
            setSubMessage('The game continues...');
        } else {
            setMessage(`${lastEjected} was ejected.`);
            if (wasSpy) {
                setSubMessage(remainingSpies === 0 ? 'They were the last Spy!' : `They were a Spy. ${remainingSpies} remain.`);
            } else {
                setSubMessage('They were NOT a Spy.');
            }
        }

        // Timer to proceed
        if (players[0] === playerName) {
            const timer = setTimeout(async () => {
                // Win Condition Check
                if (remainingSpies === 0) {
                    await setWinner(roomCode, 'AGENTS');
                    await updateGamePhase(roomCode, 'RESULTS');
                } else {
                    // Spies Win Check? (Remaining Spies >= Remaining Agents)
                    // Active Players = Total - Ejected
                    const allEjectedCount = Object.keys(ejectedPlayers || {}).length + (ejectedPlayers?.[lastEjected] ? 0 : 1);
                    const activePlayers = players.length - allEjectedCount;
                    const activeSpies = remainingSpies;

                    // Standard Mafia rule: If Spies >= Agents, Spies win?
                    // Spyfall doesn't usually have this, but Among Us does (Impostors >= Crewmates)
                    // Let's implement it for balance.
                    if (activeSpies >= (activePlayers - activeSpies)) {
                        // Spies Win
                        await setWinner(roomCode, 'SPY');
                        await updateGamePhase(roomCode, 'RESULTS');
                    } else {
                        // Continue Game
                        await clearVotes(roomCode);
                        await updateGamePhase(roomCode, 'PLAYING');
                    }
                }
            }, 6000); // 6 seconds to read
            return () => clearTimeout(timer);
        }
    }, [gameData, lastEjected, ejectedPlayers, players, playerName, roomCode]);

    return (
        <div className="screen-container" style={{ justifyContent: 'center', backgroundColor: 'black' }}>
            <div className="star-field" /> {/* Reusing CSS star field if available, else black is fine */}

            <div className="animate-float" style={{ textAlign: 'center', zIndex: 10 }}>
                <div style={{ marginBottom: 32 }}>
                    {isSpy ? (
                        <Skull size={80} color="#ef4444" style={{ filter: 'drop-shadow(0 0 20px #ef4444)' }} />
                    ) : (
                        <UserX size={80} color="#64748b" />
                    )}
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: 16,
                    color: isSpy ? '#ef4444' : '#fff'
                }}>
                    {message}
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    opacity: 0.8
                }}>
                    {subMessage}
                </p>
            </div>
        </div>
    );
}
