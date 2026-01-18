import React, { useState, useEffect } from 'react';
import { User, Shield, Skull, X, CheckCircle } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';

export default function VotingScreen({ players, gameData, setGameState, setPlayers, gameData: currentGameData, setGameData }) {
    const { playSfx } = useSound();
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedOut, setVotedOut] = useState(null);
    const [showReveal, setShowReveal] = useState(false);

    const handleVote = (player) => {
        if (hasVoted) return;

        setSelectedPlayer(player);
        setHasVoted(true);

        // Show reveal after short delay
        setTimeout(() => {
            setVotedOut(player);
            setShowReveal(true);
        }, 1000);
    };

    const handleContinue = () => {
        if (!votedOut) return;

        const wasSpy = currentGameData.spies.includes(votedOut);

        // Remove voted player from players list
        const remainingPlayers = players.filter(p => p !== votedOut);

        // Update spies list if spy was eliminated
        const remainingSpies = currentGameData.spies.filter(s => s !== votedOut);

        // Update game data
        setGameData({
            ...currentGameData,
            spies: remainingSpies
        });
        setPlayers(remainingPlayers);

        // Check win conditions
        const agentsLeft = remainingPlayers.length - remainingSpies.length;

        if (remainingSpies.length === 0) {
            // All spies eliminated - Agents win!
            playSfx('success');
            setGameState('RESULTS_AGENTS_WIN');
        } else if (remainingSpies.length >= agentsLeft) {
            // Spies equal or outnumber agents - Spies win!
            playSfx('failure');
            setGameState('RESULTS_SPY_WIN');
        } else {
            // Game continues - return to playing
            playSfx('transition');
            setGameState('PLAYING');
        }
    };

    if (showReveal && votedOut) {
        const wasSpy = currentGameData.spies.includes(votedOut);

        return (
            <div className="screen-container">
                <div className="animate-spring-in" style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* Icon */}
                    <div className="animate-bounce" style={{
                        width: 100,
                        height: 100,
                        margin: '0 auto 24px',
                        borderRadius: '50%',
                        background: wasSpy
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))'
                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: wasSpy ? '3px solid var(--error)' : '3px solid var(--accent)'
                    }}>
                        {wasSpy ? <Skull size={48} color="var(--error)" /> : <Shield size={48} color="var(--accent)" />}
                    </div>

                    {/* Player name */}
                    <h2 className="animate-text-reveal" style={{ fontSize: '2rem', marginBottom: 12, fontWeight: 800 }}>
                        {votedOut}
                    </h2>

                    {/* Role reveal */}
                    <div className="animate-fade-in stagger-1" style={{
                        padding: 16,
                        background: wasSpy ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 12,
                        border: wasSpy ? '1px solid var(--error)' : '1px solid var(--accent)',
                        marginBottom: 24
                    }}>
                        <p style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: wasSpy ? 'var(--error)' : 'var(--accent-light)'
                        }}>
                            {wasSpy ? 'WAS A SPY' : 'WAS AN AGENT'}
                        </p>
                    </div>

                    {/* Status message */}
                    <p className="animate-fade-in stagger-2" style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
                        {wasSpy
                            ? currentGameData.spies.filter(s => s !== votedOut).length > 0
                                ? `${currentGameData.spies.filter(s => s !== votedOut).length} spy(ies) remaining...`
                                : 'All spies eliminated!'
                            : 'An innocent was voted out...'
                        }
                    </p>

                    <button
                        className="btn-primary animate-pop"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="screen-container">
            <div className="animate-spring-in" style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Vote to Eject</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Who is the spy?</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                    overflowY: 'auto',
                    paddingBottom: 20
                }}>
                    {players.map((player, i) => (
                        <button
                            key={player}
                            onClick={() => handleVote(player)}
                            disabled={hasVoted}
                            className={`animate-fade-in stagger-${Math.min(i, 5)}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 16,
                                background: selectedPlayer === player
                                    ? 'var(--accent)'
                                    : 'rgba(255,255,255,0.05)',
                                border: selectedPlayer === player
                                    ? '2px solid var(--accent-light)'
                                    : '1px solid var(--border)',
                                borderRadius: 16,
                                transition: 'all 0.2s ease',
                                transform: selectedPlayer === player ? 'scale(0.95)' : 'scale(1)',
                                opacity: hasVoted && selectedPlayer !== player ? 0.5 : 1
                            }}
                        >
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: selectedPlayer === player ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8
                            }}>
                                {selectedPlayer === player ? (
                                    <CheckCircle size={20} color="white" />
                                ) : (
                                    <User size={20} color="var(--text-secondary)" />
                                )}
                            </div>
                            <span style={{
                                color: selectedPlayer === player ? 'white' : 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                {player}
                            </span>
                        </button>
                    ))}
                </div>

                {hasVoted && !showReveal && (
                    <div className="animate-pop" style={{
                        marginTop: 'auto',
                        padding: 16,
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 12,
                        border: '1px solid var(--accent)'
                    }}>
                        <p style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
                            {selectedPlayer} was ejected...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
