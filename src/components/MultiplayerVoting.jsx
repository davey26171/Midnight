import React, { useState, useEffect } from 'react';
import { User, Check, Clock, Vote } from 'lucide-react';
import { subscribeToRoom, submitVote, updateGamePhase, setWinner, ejectPlayer } from '../firebase';

export default function MultiplayerVoting({ roomCode, playerName, gameData, players, ejected }) {
    const [votes, setVotes] = useState({});
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [confidence, setConfidence] = useState(75);
    const [notes, setNotes] = useState('');
    const [afkTimer, setAfkTimer] = useState(90);

    const votedCount = Object.keys(votes).length;
    // Calculate total eligible voters (alive players)
    // Actually, can dead players vote? In Among US, NO.
    // players array includes everyone.
    // ejeted is map { name: true }.
    const activePlayers = players.filter(p => !ejected || !ejected[p]);
    const activePlayerCount = activePlayers.length;
    const allVoted = votedCount >= activePlayerCount;

    // Subscribe to votes
    useEffect(() => {
        if (!roomCode) return;

        const unsubscribe = subscribeToRoom(roomCode, (data) => {
            if (data?.votes) {
                setVotes(data.votes);

                // Check if current player already voted
                if (data.votes[playerName]) {
                    setHasVoted(true);
                    setSelectedPlayer(data.votes[playerName]);
                }
            }

            // Check if all voted
            // Note: We check if vote count matches ACTIVE players
            const currentVotes = data?.votes ? Object.keys(data.votes).length : 0;
            const currentEjected = data?.ejected || {};
            const currentActiveCount = players.filter(p => !currentEjected[p]).length;

            if (currentVotes > 0 && currentVotes >= currentActiveCount) {
                // Host handles the transition
                if (players[0] === playerName) {
                    const votesObj = data.votes;
                    const counts = {};
                    Object.values(votesObj).forEach(votedPlayer => {
                        counts[votedPlayer] = (counts[votedPlayer] || 0) + 1;
                    });

                    let maxVotes = 0;
                    let mostVoted = null;
                    let isTie = false;

                    Object.entries(counts).forEach(([player, count]) => {
                        if (count > maxVotes) {
                            maxVotes = count;
                            mostVoted = player;
                            isTie = false;
                        } else if (count === maxVotes) {
                            isTie = true;
                        }
                    });

                    setTimeout(async () => {
                        if (isTie || !mostVoted || maxVotes === 0) {
                            await ejectPlayer(roomCode, 'SKIP');
                        } else {
                            await ejectPlayer(roomCode, mostVoted);
                        }
                        updateGamePhase(roomCode, 'EJECTION');
                    }, 1000);
                }
            }
        });

        return unsubscribe;
    }, [roomCode, playerName, players.length]); // Dependencies

    // AFK timer for voting
    useEffect(() => {
        if (hasVoted) return;
        // If I am dead, I shouldn't auto-vote?
        if (ejected && ejected[playerName]) return;

        const interval = setInterval(() => {
            setAfkTimer(prev => {
                if (prev <= 1) {
                    // Auto-vote for random player (skip self? skip dead?)
                    // Simple random:
                    const randomPlayer = players[Math.floor(Math.random() * players.length)];
                    handleVote(randomPlayer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [hasVoted, players, ejected, playerName]);

    const handleVote = async (player) => {
        if (hasVoted) return;
        // Check if dead
        if (ejected && ejected[playerName]) return;

        setSelectedPlayer(player);
        setHasVoted(true);

        if (roomCode) {
            await submitVote(roomCode, playerName, player);
        }
    };

    // Voting view
    return (
        <div className="screen-container">
            <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: 8 }}>
                Vote to Eject
            </h2>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: 20 }}>
                    <Vote size={18} color="var(--accent)" />
                    <span style={{ fontWeight: 600 }}>{votedCount}/{activePlayerCount} Voted</span>
                </div>

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Clock size={14} color={afkTimer < 15 ? 'var(--error)' : 'var(--text-muted)'} />
                    <span style={{
                        fontSize: '0.9rem',
                        color: afkTimer < 15 ? 'var(--error)' : 'var(--text-muted)',
                        fontWeight: afkTimer < 15 ? 700 : 400
                    }}>
                        {afkTimer}s remaining
                    </span>
                </div>
            </div>

            <div className="grid-container" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: 12,
                maxHeight: '40vh',
                overflowY: 'auto'
            }}>
                {players.map(player => {
                    const playerVoted = votes[player] !== undefined;
                    const isSelected = selectedPlayer === player;
                    const isEjected = ejected && ejected[player];

                    if (isEjected) return null; // Don't show dead players

                    return (
                        <button
                            key={player}
                            onClick={() => !hasVoted && handleVote(player)}
                            disabled={hasVoted || isEjected}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 16,
                                background: isSelected
                                    ? 'var(--accent)'
                                    : 'rgba(255,255,255,0.05)',
                                border: isSelected
                                    ? '2px solid var(--accent-light)'
                                    : '1px solid var(--border)',
                                borderRadius: 16,
                                cursor: (hasVoted || isEjected) ? 'default' : 'pointer',
                                opacity: (hasVoted && !isSelected) ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8
                            }}>
                                {playerVoted ? (
                                    <Check size={18} color="var(--success)" />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>
                            <span style={{
                                color: isSelected ? 'white' : 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                {player}
                            </span>
                            {playerVoted && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    Voted
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Confidence & Notes (multiplayer feature) */}
            {selectedPlayer && !hasVoted && (
                <div className="glass-card" style={{ padding: 16, marginTop: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                            Confidence: {confidence}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={confidence}
                            onChange={(e) => setConfidence(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent)' }}
                        />
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Why do you suspect them? (optional)"
                        maxLength={100}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            resize: 'none',
                            minHeight: 60
                        }}
                    />
                </div>
            )}

            {hasVoted && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Waiting for other players...
                    </p>
                </div>
            )}
        </div>
    );
}
