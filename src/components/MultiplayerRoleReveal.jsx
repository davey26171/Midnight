import React, { useState, useEffect, useRef } from 'react';
import { Clock, Users, Check, Loader } from 'lucide-react';
import { subscribeToRoom, markPlayerReady, updateGamePhase } from '../firebase';

export default function MultiplayerRoleReveal({ roomCode, playerName, gameData, players }) {
    const [hasSeenCard, setHasSeenCard] = useState(false);
    const [playersReady, setPlayersReady] = useState({});
    const [afkTimer, setAfkTimer] = useState(60);
    const [showCard, setShowCard] = useState(false);
    const hasTransitioned = useRef(false);

    const playerRole = gameData?.roleMap?.[playerName] || 'agent';
    const isSpy = playerRole === 'spy' || playerRole === 'assassin';
    const isDoubleAgent = playerRole === 'doubleAgent' || playerRole === 'doubleagent';
    const isHealer = playerRole === 'healer';
    const isInnocent = playerRole === 'innocent';

    const readyCount = Object.keys(playersReady).length;
    const totalPlayers = players.length;
    const allReady = readyCount >= totalPlayers;

    // Subscribe to room for ready status
    useEffect(() => {
        if (!roomCode) return;

        const unsubscribe = subscribeToRoom(roomCode, (data) => {
            if (data?.playersReady) {
                setPlayersReady(data.playersReady);
            }
            // Move to playing when all ready
            if (data?.gameState === 'PLAYING') {
                // Parent will handle this transition
            }
        });

        return unsubscribe;
    }, [roomCode]);

    // AFK timer
    useEffect(() => {
        if (hasSeenCard || allReady) return;

        const interval = setInterval(() => {
            setAfkTimer(prev => {
                if (prev <= 1) {
                    // Auto-ready after timeout
                    handleReady();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [hasSeenCard, allReady]);

    // Check if all players ready and transition
    useEffect(() => {
        if (allReady && roomCode && !hasTransitioned.current) {
            hasTransitioned.current = true;
            console.log('All players ready, transitioning to PLAYING...');

            // Small delay then transition
            const timer = setTimeout(async () => {
                try {
                    await updateGamePhase(roomCode, 'PLAYING');
                    console.log('Transitioned to PLAYING');
                } catch (e) {
                    console.error('Error transitioning:', e);
                    hasTransitioned.current = false; // Allow retry
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [allReady, roomCode]);

    const handleReady = async () => {
        if (hasSeenCard) return;
        setHasSeenCard(true);
        if (roomCode) {
            await markPlayerReady(roomCode, playerName);
        }
    };

    const getRoleColor = () => {
        if (isSpy) return '#ef4444';
        if (isDoubleAgent) return '#a855f7';
        if (isHealer) return '#22c55e';
        if (isInnocent) return '#f59e0b';
        return 'var(--accent-light)';
    };

    const getRoleName = () => {
        if (playerRole === 'spy') return 'SPY';
        if (playerRole === 'assassin') return 'ASSASSIN';
        if (playerRole === 'doubleAgent' || playerRole === 'doubleagent') return 'DOUBLE AGENT';
        if (playerRole === 'healer') return 'HEALER';
        if (playerRole === 'innocent') return 'INNOCENT';
        return 'AGENT';
    };

    const getRoleDescription = () => {
        if (isSpy) return "Blend in. Don't get caught.";
        if (isDoubleAgent) return "You work for both sides. Help the spies secretly!";
        if (isHealer) return "You can save one innocent from ejection!";
        return null;
    };

    // Card reveal view
    if (!hasSeenCard) {
        return (
            <div className="screen-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{playerName}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Tap to reveal your role</p>

                    {/* Card */}
                    <div
                        onClick={() => setShowCard(true)}
                        style={{
                            width: 200,
                            height: 280,
                            margin: '0 auto',
                            borderRadius: 16,
                            background: showCard
                                ? `linear - gradient(135deg, ${getRoleColor()}22, ${getRoleColor()}44)`
                                : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                            border: `2px solid ${showCard ? getRoleColor() : 'var(--border)'} `,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: showCard ? `0 0 30px ${getRoleColor()} 44` : 'none'
                        }}
                    >
                        {showCard ? (
                            <>
                                <h3 style={{ color: getRoleColor(), fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>
                                    {getRoleName()}
                                </h3>
                                {/* Show secret word for agents and healer (not spies or double agents) */}
                                {!isSpy && !isDoubleAgent && !isInnocent && (
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        marginBottom: 16
                                    }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secret Word</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{gameData.word}</p>
                                    </div>
                                )}
                                {/* Role-specific descriptions */}
                                {getRoleDescription() && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', maxWidth: 160 }}>
                                        {getRoleDescription()}
                                    </p>
                                )}
                                {isInnocent && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        You don't know the word!
                                    </p>
                                )}
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Tap to reveal</p>
                        )}
                    </div>

                    {showCard && (
                        <button
                            onClick={handleReady}
                            className="btn-primary"
                            style={{ marginTop: 24, width: 200 }}
                        >
                            <Check size={18} /> I'm Ready
                        </button>
                    )}

                    {/* AFK Timer */}
                    {!showCard && (
                        <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            Auto-proceed in {afkTimer}s
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Waiting for others
    return (
        <div className="screen-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader size={48} color="var(--accent)" className="animate-spin" style={{ marginBottom: 24 }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Waiting for Players</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                    {readyCount} of {totalPlayers} ready
                </p>

                {/* Player status list */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center',
                    maxWidth: 300,
                    margin: '0 auto'
                }}>
                    {players.map(p => (
                        <div
                            key={p}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: playersReady[p] ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.2)',
                                border: `1px solid ${playersReady[p] ? '#22c55e' : 'var(--border)'} `,
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            {playersReady[p] && <Check size={12} color="#22c55e" />}
                            {p}
                        </div>
                    ))}
                </div>

                {allReady && (
                    <p style={{ marginTop: 24, color: 'var(--success)' }}>
                        All players ready! Starting game...
                    </p>
                )}
            </div>
        </div>
    );
}
