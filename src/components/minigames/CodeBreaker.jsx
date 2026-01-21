import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, XCircle, ArrowLeft, Trophy, Zap } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Orange', 'Purple', 'Pink'];

export default function CodeBreaker({ onClose }) {
    const [level, setLevel] = useState(1);
    const [sequence, setSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [showSequence, setShowSequence] = useState(true);
    const [gameState, setGameState] = useState('showing'); // showing, playing, won, lost
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [flashIndex, setFlashIndex] = useState(-1);

    // Generate sequence based on level
    const generateSequence = (lvl) => {
        const length = Math.min(3 + lvl, 8);
        const seq = [];
        for (let i = 0; i < length; i++) {
            seq.push(Math.floor(Math.random() * COLORS.length));
        }
        return seq;
    };

    // Initialize level
    useEffect(() => {
        const seq = generateSequence(level);
        setSequence(seq);
        setUserSequence([]);
        setShowSequence(true);
        setGameState('showing');
        setTimeLeft(30);

        // Flash sequence
        let index = 0;
        const interval = setInterval(() => {
            if (index < seq.length) {
                setFlashIndex(index);
                index++;
            } else {
                clearInterval(interval);
                setFlashIndex(-1);
                setTimeout(() => {
                    setShowSequence(false);
                    setGameState('playing');
                }, 500);
            }
        }, 600);

        return () => clearInterval(interval);
    }, [level]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) {
            setGameState('lost');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Check user input
    useEffect(() => {
        if (userSequence.length === 0) return;

        // Check if current input matches
        const lastIndex = userSequence.length - 1;
        if (userSequence[lastIndex] !== sequence[lastIndex]) {
            setGameState('lost');
            return;
        }

        // Check if completed
        if (userSequence.length === sequence.length) {
            const bonusPoints = Math.floor(timeLeft * 10);
            setScore(prev => prev + 100 * level + bonusPoints);

            if (level >= 5) {
                setGameState('won');
            } else {
                setTimeout(() => {
                    setLevel(prev => prev + 1);
                }, 1000);
            }
        }
    }, [userSequence, sequence, level, timeLeft]);

    const handleColorClick = (colorIndex) => {
        if (gameState !== 'playing') return;
        setUserSequence([...userSequence, colorIndex]);
    };

    const restartGame = () => {
        setLevel(1);
        setScore(0);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary)',
            zIndex: 100,
            overflow: 'auto',
            padding: '20px'
        }}>
            <div className="screen-container" style={{ maxWidth: 500, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>{score}</div>
                    </div>
                </div>

                {/* Title Card */}
                <div className="glass-card" style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Lock size={40} color="var(--accent-light)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Code Breaker</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Memorize and replicate the color sequence
                    </p>
                </div>

                {/* Game Info */}
                <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{level}/5</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: timeLeft < 10 ? 'var(--error)' : 'var(--text-primary)'
                            }}>
                                {timeLeft}s
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {userSequence.length}/{sequence.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sequence Display */}
                {showSequence && (
                    <div className="glass-card animate-fade-in" style={{ padding: 20, marginBottom: 20 }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
                            Memorize this sequence...
                        </p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {sequence.map((colorIndex, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 8,
                                        background: COLORS[colorIndex],
                                        opacity: flashIndex === i ? 1 : 0.3,
                                        transform: flashIndex === i ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: flashIndex === i ? `0 0 20px ${COLORS[colorIndex]}` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* User Input Display */}
                {!showSequence && gameState === 'playing' && (
                    <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
                            Your sequence
                        </p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', minHeight: 50 }}>
                            {userSequence.map((colorIndex, i) => (
                                <div
                                    key={i}
                                    className="animate-scale-in"
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 8,
                                        background: COLORS[colorIndex],
                                        boxShadow: `0 0 10px ${COLORS[colorIndex]}`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Palette */}
                {!showSequence && gameState === 'playing' && (
                    <div className="glass-card" style={{ padding: 20 }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
                            Select colors in order
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {COLORS.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleColorClick(i)}
                                    style={{
                                        height: 70,
                                        borderRadius: 12,
                                        background: color,
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        color: 'white',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    {COLOR_NAMES[i]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Win Screen */}
                {gameState === 'won' && (
                    <div className="modal-overlay">
                        <div className="glass-card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }}>
                            <Trophy size={60} color="var(--accent-light)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Mission Complete!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                All codes cracked! You're a master hacker.
                            </p>
                            <div style={{
                                background: 'var(--accent-glow)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Final Score</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                                    {score}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={restartGame} className="btn-primary" style={{ flex: 1 }}>
                                    Play Again
                                </button>
                                <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lose Screen */}
                {gameState === 'lost' && (
                    <div className="modal-overlay">
                        <div className="glass-card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }}>
                            <XCircle size={60} color="var(--error)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Code Failed</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                {timeLeft <= 0 ? 'Time ran out!' : 'Wrong sequence!'}
                            </p>
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{score}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={restartGame} className="btn-primary" style={{ flex: 1 }}>
                                    Try Again
                                </button>
                                <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
