import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Trophy, Clock, CheckCircle } from 'lucide-react';

const EVIDENCE_ITEMS = [
    { id: 1, name: 'Fingerprint', emoji: '👆', x: 15, y: 25 },
    { id: 2, name: 'Key', emoji: '🔑', x: 75, y: 15 },
    { id: 3, name: 'Document', emoji: '📄', x: 40, y: 60 },
    { id: 4, name: 'USB Drive', emoji: '💾', x: 60, y: 40 },
    { id: 5, name: 'Badge', emoji: '🎫', x: 25, y: 75 },
    { id: 6, name: 'Phone', emoji: '📱', x: 85, y: 70 },
    { id: 7, name: 'Watch', emoji: '⌚', x: 50, y: 30 },
    { id: 8, name: 'Camera', emoji: '📷', x: 10, y: 50 },
];

export default function EvidenceCollection({ onClose }) {
    const [foundItems, setFoundItems] = useState([]);
    const [timeLeft, setTimeLeft] = useState(45);
    const [gameState, setGameState] = useState('playing'); // playing, won, lost
    const [score, setScore] = useState(0);
    const [clickEffect, setClickEffect] = useState(null);

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
    }, [timeLeft, gameState]);

    // Check win condition
    useEffect(() => {
        if (foundItems.length === EVIDENCE_ITEMS.length && gameState === 'playing') {
            const bonusPoints = timeLeft * 20;
            setScore(1000 + bonusPoints);
            setGameState('won');
        }
    }, [foundItems, timeLeft, gameState]);

    const handleItemClick = (item) => {
        if (foundItems.includes(item.id) || gameState !== 'playing') return;

        setFoundItems([...foundItems, item.id]);
        setClickEffect({ x: item.x, y: item.y });
        setTimeout(() => setClickEffect(null), 500);
    };

    const restartGame = () => {
        setFoundItems([]);
        setTimeLeft(45);
        setGameState('playing');
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
            <div className="screen-container" style={{ maxWidth: 600, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                {foundItems.length}/{EVIDENCE_ITEMS.length}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time</div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: timeLeft < 10 ? 'var(--error)' : 'var(--text-primary)'
                            }}>
                                {timeLeft}s
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title Card */}
                <div className="glass-card" style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Search size={40} color="var(--accent-light)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Evidence Collection</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Find all {EVIDENCE_ITEMS.length} hidden evidence items before time runs out
                    </p>
                </div>

                {/* Game Area */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '100%',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                        cursor: 'crosshair',
                        overflow: 'hidden'
                    }}>
                        {/* Dark overlay pattern */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                            pointerEvents: 'none'
                        }} />

                        {/* Evidence Items */}
                        {EVIDENCE_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                style={{
                                    position: 'absolute',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '2rem',
                                    cursor: 'pointer',
                                    opacity: foundItems.includes(item.id) ? 0 : 0.7,
                                    transition: 'all 0.3s ease',
                                    filter: foundItems.includes(item.id) ? 'blur(10px)' : 'none',
                                    pointerEvents: foundItems.includes(item.id) ? 'none' : 'auto'
                                }}
                                onMouseEnter={(e) => {
                                    if (!foundItems.includes(item.id)) {
                                        e.target.style.transform = 'translate(-50%, -50%) scale(1.2)';
                                        e.target.style.opacity = '1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!foundItems.includes(item.id)) {
                                        e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                                        e.target.style.opacity = '0.7';
                                    }
                                }}
                            >
                                {item.emoji}
                            </div>
                        ))}

                        {/* Click Effect */}
                        {clickEffect && (
                            <div
                                className="animate-scale-in"
                                style={{
                                    position: 'absolute',
                                    left: `${clickEffect.x}%`,
                                    top: `${clickEffect.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none'
                                }}
                            >
                                <CheckCircle size={40} color="var(--success)" style={{ filter: 'drop-shadow(0 0 10px var(--success))' }} />
                            </div>
                        )}

                        {/* Scanning lines effect */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.03) 2px, rgba(99, 102, 241, 0.03) 4px)',
                            pointerEvents: 'none',
                            animation: 'scan 3s linear infinite'
                        }} />
                    </div>
                </div>

                {/* Items List */}
                <div className="glass-card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
                        Evidence Checklist
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {EVIDENCE_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: foundItems.includes(item.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)',
                                    borderRadius: 8,
                                    border: `1px solid ${foundItems.includes(item.id) ? 'var(--success)' : 'var(--border)'}`,
                                    textDecoration: foundItems.includes(item.id) ? 'line-through' : 'none',
                                    opacity: foundItems.includes(item.id) ? 0.6 : 1,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                                <span style={{ fontSize: '0.85rem', flex: 1 }}>{item.name}</span>
                                {foundItems.includes(item.id) && (
                                    <CheckCircle size={16} color="var(--success)" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Win Screen */}
                {gameState === 'won' && (
                    <div className="modal-overlay">
                        <div className="glass-card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }}>
                            <Trophy size={60} color="var(--accent-light)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Evidence Secured!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                All items collected. Excellent detective work!
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
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                    Time Bonus: +{timeLeft * 20} pts
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={restartGame} className="btn-primary" style={{ flex: 1 }}>
                                    Search Again
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
                            <Clock size={60} color="var(--error)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Time Expired!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                Not all evidence was collected in time.
                            </p>
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Items Found</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                                    {foundItems.length}/{EVIDENCE_ITEMS.length}
                                </div>
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

            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
}
