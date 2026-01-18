import React, { useEffect } from 'react';
import { Trophy, Skull, RefreshCcw, Sparkles } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';

export default function Results({ winner, gameData, resetGame }) {
    const isSpyWin = winner === 'SPY';
    const spyNames = gameData.spies ? gameData.spies.join(', ') : 'Unknown';
    const { playSfx } = useSound();

    // Play win/loss sound on mount
    useEffect(() => {
        if (isSpyWin) {
            playSfx('failure'); // Agents failed, spy won
        } else {
            playSfx('success'); // Agents succeeded
        }
    }, [isSpyWin, playSfx]);

    return (
        <div className="screen-container" style={{ justifyContent: 'center', overflow: 'hidden' }}>
            {/* Background Effect */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: isSpyWin
                    ? 'radial-gradient(circle at 50% 30%, rgba(239,68,68,0.15) 0%, transparent 60%)'
                    : 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />

            <div className="animate-spring-in" style={{ textAlign: 'center', position: 'relative' }}>
                {/* Icon */}
                <div className="animate-bounce" style={{
                    width: 100,
                    height: 100,
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    background: isSpyWin
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))'
                        : 'linear-gradient(135deg, var(--accent-glow), rgba(99, 102, 241, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSpyWin
                        ? '0 0 60px rgba(239, 68, 68, 0.4)'
                        : '0 0 60px var(--accent-glow)',
                    border: `2px solid ${isSpyWin ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.5)'}`
                }}>
                    {isSpyWin ? (
                        <Skull size={48} color="var(--error)" />
                    ) : (
                        <Trophy size={48} color="var(--accent-light)" />
                    )}
                </div>

                {/* Title */}
                <h1 className="animate-text-reveal" style={{
                    fontSize: '2rem',
                    color: isSpyWin ? 'var(--error)' : 'var(--accent-light)',
                    marginBottom: 8,
                    fontWeight: 800,
                    textShadow: isSpyWin
                        ? '0 0 30px rgba(239,68,68,0.5)'
                        : '0 0 30px var(--accent-glow)'
                }}>
                    {isSpyWin ? 'Mission Failed' : 'Mission Success!'}
                </h1>
                <p className="animate-fade-in stagger-1" style={{
                    color: 'var(--text-muted)',
                    marginBottom: 28,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}>
                    <Sparkles size={14} />
                    {isSpyWin ? 'The spy escaped undetected' : 'The spy was exposed'}
                </p>

                {/* Stats Card */}
                <div className="glass-card animate-slide-left stagger-2" style={{ marginBottom: 20 }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        textAlign: 'left'
                    }}>
                        {/* Spy Reveal */}
                        <div style={{
                            padding: 18,
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: 'var(--error)'
                            }} />
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: 6
                            }}>
                                {gameData.spies && gameData.spies.length > 1 ? 'The Spies Were' : 'The Spy Was'}
                            </p>
                            <p className="animate-pop" style={{
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                color: 'var(--error)',
                                textShadow: '0 0 20px rgba(239,68,68,0.3)'
                            }}>
                                {spyNames}
                            </p>
                        </div>

                        {/* Word Reveal */}
                        <div style={{
                            padding: 18,
                            background: 'var(--accent-glow)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: 'var(--accent)'
                            }} />
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: 6
                            }}>
                                Secret Word
                            </p>
                            <p className="animate-pop stagger-1" style={{
                                fontSize: '1.25rem',
                                fontWeight: 800,
                                color: 'var(--accent-light)',
                                textShadow: '0 0 20px var(--accent-glow)'
                            }}>
                                {gameData.word ? gameData.word : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Play Again */}
                <button className="btn-primary animate-glow stagger-3" onClick={resetGame} style={{ marginTop: 8 }}>
                    <RefreshCcw size={18} />
                    Play Again
                </button>
            </div>
        </div>
    );
}
