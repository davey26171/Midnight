import React, { useState, useEffect } from 'react';
import { Shield, User, Sparkles } from 'lucide-react';

export default function RoleReveal({ gameData, players, setGameState }) {
    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showRevealEffect, setShowRevealEffect] = useState(false);

    const currentPlayer = players[currentPlayerIdx];
    const isSpy = gameData.spies.includes(currentPlayer);

    // Dramatic reveal effect when card flips
    useEffect(() => {
        if (isFlipped) {
            setShowRevealEffect(true);
            const timer = setTimeout(() => setShowRevealEffect(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isFlipped]);

    const handleTap = () => {
        if (isTransitioning) return;

        if (!isFlipped) {
            setIsFlipped(true);
        } else {
            setIsTransitioning(true);
            setIsFlipped(false);

            setTimeout(() => {
                if (currentPlayerIdx < players.length - 1) {
                    setCurrentPlayerIdx(prev => prev + 1);
                    setIsTransitioning(false);
                } else {
                    setGameState('PLAYING');
                }
            }, 400);
        }
    };

    return (
        <div
            className="screen-container"
            style={{ justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
            onClick={handleTap}
        >
            {/* Subtle border glow on reveal */}
            {showRevealEffect && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        boxShadow: isSpy
                            ? 'inset 0 0 100px rgba(239,68,68,0.2)'
                            : 'inset 0 0 100px rgba(99,102,241,0.2)',
                        pointerEvents: 'none',
                        zIndex: 100,
                        transition: 'box-shadow 0.5s ease'
                    }}
                />
            )}

            <div
                key={currentPlayerIdx}
                className="animate-spring-in"
                style={{ width: '100%', textAlign: 'center' }}
            >
                {/* Player Avatar */}
                <div className="animate-bounce" style={{
                    width: 56,
                    height: 56,
                    margin: '0 auto 12px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px var(--accent-glow)'
                }}>
                    <User size={28} color="white" />
                </div>

                {/* Player Name */}
                <h2 className="animate-text-reveal" style={{
                    marginBottom: 4,
                    fontSize: '1.75rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700
                }}>
                    {currentPlayer}
                </h2>
                <p className="animate-fade-in stagger-1" style={{
                    marginBottom: 28,
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}>
                    <Sparkles size={14} />
                    Player {currentPlayerIdx + 1} of {players.length}
                </p>

                {/* Card */}
                <div
                    className="perspective-container"
                    style={{
                        width: '280px',
                        height: '400px',
                        margin: '0 auto 24px',
                        opacity: isTransitioning ? 0 : 1,
                        transform: isTransitioning ? 'scale(0.8) rotateY(-20deg)' : 'scale(1)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                        {/* FRONT OF CARD */}
                        <div className="flip-card-front" style={{
                            background: 'linear-gradient(145deg, #1a1c2e, #0f1018)',
                            border: '2px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}>
                            {/* Decorative pattern */}
                            <div style={{
                                position: 'absolute',
                                inset: 20,
                                border: '1px solid var(--border)',
                                borderRadius: 16,
                                opacity: 0.5
                            }} />

                            <div className="animate-pulse" style={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent-glow), transparent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                                boxShadow: '0 0 40px var(--accent-glow)'
                            }}>
                                <Shield size={48} color="var(--accent)" />
                            </div>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em'
                            }}>
                                Tap to reveal
                            </p>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                marginTop: 8
                            }}>
                                Your role awaits...
                            </p>
                        </div>

                        {/* BACK OF CARD */}
                        <div className="flip-card-back" style={{
                            backgroundImage: isSpy ? 'url("/spy-card.png")' : 'url("/agent-card.png")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: isSpy
                                ? '0 0 60px rgba(239, 68, 68, 0.4), 0 20px 60px rgba(0,0,0,0.5)'
                                : '0 0 60px var(--accent-glow), 0 20px 60px rgba(0,0,0,0.5)',
                            border: `3px solid ${isSpy ? '#ef4444' : 'var(--accent)'}`
                        }}>
                            {/* Role Info Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                padding: '32px 20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.8), transparent)',
                                textAlign: 'center'
                            }}>
                                <h3
                                    className={isFlipped ? 'animate-text-reveal' : ''}
                                    style={{
                                        color: isSpy ? '#ef4444' : 'var(--accent-light)',
                                        fontSize: '1.6rem',
                                        marginBottom: 12,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        fontWeight: 800,
                                        textShadow: isSpy
                                            ? '0 0 20px rgba(239,68,68,0.5)'
                                            : '0 0 20px var(--accent-glow)'
                                    }}
                                >
                                    {isSpy ? 'THE SPY' : 'AGENT'}
                                </h3>

                                {!isSpy && (
                                    <div
                                        className={isFlipped ? 'animate-spring-in' : ''}
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.15)',
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--accent)',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                                            Secret Word
                                        </p>
                                        <p style={{
                                            fontSize: '1rem',
                                            color: 'white',
                                            fontWeight: 700
                                        }}>
                                            {gameData.word}
                                        </p>
                                    </div>
                                )}

                                {isSpy && (
                                    <p
                                        className={isFlipped ? 'animate-fade-in' : ''}
                                        style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '0.9rem',
                                            fontStyle: 'italic',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        Blend in. Don't get caught.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <p
                    className="animate-fade-in"
                    style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        padding: '12px 20px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 12,
                        display: 'inline-block'
                    }}
                >
                    {isTransitioning
                        ? '⏳ Passing device...'
                        : isFlipped
                            ? (currentPlayerIdx < players.length - 1
                                ? `👉 Tap to pass to ${players[currentPlayerIdx + 1]}`
                                : '🎮 Tap to start the game!')
                            : '👆 Tap the card to reveal'
                    }
                </p>
            </div>
        </div >
    );
}
