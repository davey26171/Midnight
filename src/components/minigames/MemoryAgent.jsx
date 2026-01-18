import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Clock, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
import { GameIcon, MEMORY_CARD_ICONS } from '../../icons';

export default function MemoryAgent({ onBack }) {
    const [gameState, setGameState] = useState('ready'); // ready, playing, won
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [bestTime, setBestTime] = useState(() => {
        const saved = localStorage.getItem('memoryagent_besttime');
        return saved ? parseInt(saved) : null;
    });

    // Initialize cards
    const initCards = () => {
        // Create pairs from the icon names
        const pairs = [...MEMORY_CARD_ICONS, ...MEMORY_CARD_ICONS];
        const shuffled = pairs.sort(() => Math.random() - 0.5);
        setCards(shuffled.map((iconName, index) => ({ id: index, iconName, matched: false })));
    };

    // Start game
    const startGame = () => {
        initCards();
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setTimeElapsed(0);
        setGameState('playing');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Check for match
    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;

            if (cards[first].iconName === cards[second].iconName) {
                // Match!
                setMatched(prev => [...prev, first, second]);
                setFlipped([]);
            } else {
                // No match, flip back
                setTimeout(() => {
                    setFlipped([]);
                }, 800);
            }
            setMoves(prev => prev + 1);
        }
    }, [flipped, cards]);

    // Check for win
    useEffect(() => {
        if (matched.length === cards.length && cards.length > 0) {
            setGameState('won');
            if (!bestTime || timeElapsed < bestTime) {
                setBestTime(timeElapsed);
                localStorage.setItem('memoryagent_besttime', timeElapsed.toString());
            }
        }
    }, [matched, cards, timeElapsed, bestTime]);

    // Handle card flip
    const handleCardFlip = (index) => {
        if (gameState !== 'playing') return;
        if (flipped.length >= 2) return;
        if (flipped.includes(index)) return;
        if (matched.includes(index)) return;

        setFlipped(prev => [...prev, index]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="screen-container" style={{ gap: 20 }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 12,
                        padding: 10,
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Brain size={20} color="var(--accent)" />
                        Memory Agent
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Match all the spy cards!
                    </p>
                </div>
            </header>

            {/* Stats Bar */}
            {gameState === 'playing' && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 12,
                    padding: '12px 16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={16} color="var(--accent)" />
                        <span style={{ fontWeight: 600 }}>{moves} moves</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={16} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600 }}>{formatTime(timeElapsed)}</span>
                    </div>
                    {bestTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Trophy size={16} color="#fbbf24" />
                            <span style={{ fontWeight: 600, color: '#fbbf24' }}>{formatTime(bestTime)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Game Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {gameState === 'ready' && (
                    <div className="glass-card animate-spring-in" style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ marginBottom: 16 }} className="animate-float">
                            <GameIcon name="brain" size={64} color="var(--accent)" />
                        </div>
                        <h2 className="animate-text-reveal" style={{ marginBottom: 8 }}>Test Your Memory!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Match pairs of spy cards as fast as you can!
                        </p>
                        <button className="btn-primary animate-glow" onClick={startGame}>
                            Start Game
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 8
                    }}>
                        {cards.map((card, index) => {
                            const isFlipped = flipped.includes(index) || matched.includes(index);
                            const isMatched = matched.includes(index);

                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardFlip(index)}
                                    disabled={isMatched}
                                    style={{
                                        aspectRatio: '1',
                                        background: 'transparent',
                                        border: isMatched ? '2px solid #22c55e' : '1px solid var(--border)',
                                        borderRadius: 12,
                                        cursor: isMatched ? 'default' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        opacity: isMatched ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {isFlipped
                                        ? <GameIcon name={card.iconName} size="100%" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                                        : <GameIcon name="cardBack" size="100%" style={{ width: '100%', height: '100%', borderRadius: 10, opacity: 0.8 }} />
                                    }
                                </button>
                            );
                        })}
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="glass-card animate-spring-in" style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ marginBottom: 16 }} className="animate-bounce">
                            <GameIcon name="celebrate" size={64} color="#fbbf24" />
                        </div>
                        <h2 className="animate-text-reveal" style={{ marginBottom: 8 }}>
                            {timeElapsed === bestTime ? 'New Record!' : 'Well Done!'}
                        </h2>
                        <p className="animate-pop" style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: 'var(--accent)',
                            marginBottom: 4,
                            textShadow: '0 0 20px var(--accent-glow)'
                        }}>
                            {formatTime(timeElapsed)}
                        </p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                            {moves} moves {bestTime && `• Best: ${formatTime(bestTime)}`}
                        </p>
                        <button className="btn-primary" onClick={startGame}>
                            <RotateCcw size={18} />
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
