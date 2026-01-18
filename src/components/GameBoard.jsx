import React, { useState, useEffect } from 'react';
import { Timer, XCircle, Eye, EyeOff, AlertTriangle, Skull, Shield, Vote } from 'lucide-react';

export default function GameBoard({ timer, setGameState, players, gameData, resetGame }) {
    const [timeLeft, setTimeLeft] = useState(timer);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [suspects, setSuspects] = useState({});
    const [showWord, setShowWord] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleSuspect = (name) => {
        setSuspects(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isLowTime = timeLeft < 30;
    const progressPercent = (timeLeft / timer) * 100;

    return (
        <div className="screen-container">
            {/* Timer Card */}
            <div className="glass-card animate-spring-in" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className={isLowTime ? 'animate-pulse' : ''} style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: isLowTime ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isLowTime
                                ? '0 0 20px rgba(239,68,68,0.4)'
                                : '0 0 20px var(--accent-glow)',
                            transition: 'all 0.3s ease'
                        }}>
                            <Timer size={24} color={isLowTime ? 'var(--error)' : 'var(--accent-light)'} />
                        </div>
                        <span className={isLowTime ? 'animate-pulse' : ''} style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            color: isLowTime ? 'var(--error)' : 'var(--text-primary)',
                            fontVariantNumeric: 'tabular-nums',
                            textShadow: isLowTime ? '0 0 20px rgba(239,68,68,0.5)' : 'none'
                        }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowEndConfirm(true)}
                        style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                        End Round
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{
                    height: 6,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: isLowTime
                            ? 'linear-gradient(90deg, var(--error), #f87171)'
                            : 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                        borderRadius: 3,
                        transition: 'width 1s linear',
                        boxShadow: isLowTime ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px var(--accent-glow)'
                    }} />
                </div>
            </div>

            {/* Suspect Tracking */}
            <div className="glass-card animate-fade-in stagger-1">
                <h3 style={{
                    marginBottom: 12,
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        boxShadow: '0 0 10px var(--accent)'
                    }} />
                    Suspect Tracking
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {players.map((p, i) => (
                        <div
                            key={p}
                            onClick={() => toggleSuspect(p)}
                            className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: suspects[p] ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.2)',
                                border: suspects[p] ? '1px solid var(--error)' : '1px solid var(--border)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                textDecoration: suspects[p] ? 'line-through' : 'none',
                                opacity: suspects[p] ? 0.6 : 1,
                                transition: 'all 0.25s ease',
                                fontSize: '0.9rem'
                            }}
                        >
                            {p}
                            {suspects[p] && <XCircle size={14} color="var(--error)" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Word Reminder */}
            <div
                className="glass-card"
                onClick={() => setShowWord(!showWord)}
                style={{
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    borderColor: showWord ? 'var(--accent)' : 'var(--border)'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '8px 0'
                }}>
                    {showWord ? (
                        <>
                            <EyeOff size={18} color="var(--accent-light)" />
                            <span style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: 'var(--accent-light)',
                                letterSpacing: '0.05em'
                            }}>
                                {gameData.word.toUpperCase()}
                            </span>
                        </>
                    ) : (
                        <>
                            <Eye size={18} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Tap to see secret word (Agents only)
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* End Confirm Modal */}
            {showEndConfirm && (
                <div className="modal-overlay" onClick={() => setShowEndConfirm(false)}>
                    <div
                        className="glass-card animate-scale-in"
                        style={{ width: '100%', maxWidth: 360 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.25rem' }}>
                            End Round
                        </h2>
                        <p style={{ textAlign: 'center', marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Choose how to end the round
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}
                                onClick={() => setGameState('VOTING')}
                            >
                                <Vote size={20} /> Enter Voting
                            </button>
                            <button
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}
                                onClick={() => setGameState('RESULTS_SPY_WIN')}
                            >
                                <Skull size={20} /> Spy Won
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => setGameState('RESULTS_AGENTS_WIN')}
                            >
                                <Shield size={20} /> Agents Won
                            </button>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%' }}
                                onClick={() => setShowEndConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Up Alert */}
            {timeLeft === 0 && (
                <div className="modal-overlay">
                    <div className="glass-card animate-scale-in" style={{
                        width: '100%',
                        maxWidth: 360,
                        borderColor: 'var(--error)',
                        textAlign: 'center'
                    }}>
                        <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ color: 'var(--error)', marginBottom: 8 }}>
                            Time's Up!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
                            Discuss and vote for the suspect.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => setGameState('VOTING')}
                        >
                            Begin Voting
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
