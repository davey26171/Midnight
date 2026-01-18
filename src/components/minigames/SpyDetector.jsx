import React, { useState, useEffect, useCallback } from 'react';
import { Target, Trophy, Clock, RotateCcw, ArrowLeft, Zap } from 'lucide-react';
import { GameIcon, ICONS } from '../../icons';

// Card types using icon names instead of emojis
const CARD_TYPES = ['agent', 'agent', 'agent', 'agent', 'agent', 'spy'];

export default function SpyDetector({ onBack }) {
    const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [cards, setCards] = useState([]);
    const [revealedIndex, setRevealedIndex] = useState(null);
    const [flipSpeed, setFlipSpeed] = useState(1500);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('spydetector_highscore');
        return saved ? parseInt(saved) : 0;
    });
    const [feedback, setFeedback] = useState(null);

    // Initialize cards
    const initCards = useCallback(() => {
        const shuffled = [...CARD_TYPES].sort(() => Math.random() - 0.5);
        setCards(shuffled);
    }, []);

    // Start game
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
        setFlipSpeed(1500);
        initCards();
        setRevealedIndex(null);
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('gameover');
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem('spydetector_highscore', score.toString());
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, score, highScore]);

    // Flip cards periodically
    useEffect(() => {
        if (gameState !== 'playing') return;

        const flipTimer = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * cards.length);
            setRevealedIndex(randomIndex);

            setTimeout(() => {
                setRevealedIndex(null);
            }, flipSpeed * 0.6);
        }, flipSpeed);

        return () => clearInterval(flipTimer);
    }, [gameState, flipSpeed, cards.length]);

    // Handle card tap
    const handleCardTap = (index) => {
        if (gameState !== 'playing' || revealedIndex !== index) return;

        if (cards[index] === 'spy') {
            // Correct! Found the spy
            setScore(prev => prev + 10);
            setFeedback({ type: 'success', text: '+10' });
            setFlipSpeed(prev => Math.max(400, prev - 100)); // Speed up
            initCards(); // New arrangement
        } else {
            // Wrong! Hit a civilian
            setScore(prev => Math.max(0, prev - 5));
            setFeedback({ type: 'error', text: '-5' });
        }

        setTimeout(() => setFeedback(null), 500);
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
                        <Target size={20} color="var(--accent)" />
                        Spy Detector
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Tap the spy when revealed!
                    </p>
                </div>
            </header>

            {/* Stats Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 12,
                padding: '12px 16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={16} color="var(--accent)" />
                    <span style={{ fontWeight: 600 }}>{score}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} color={timeLeft <= 10 ? '#ef4444' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, color: timeLeft <= 10 ? '#ef4444' : 'inherit' }}>
                        {timeLeft}s
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trophy size={16} color="#fbbf24" />
                    <span style={{ fontWeight: 600, color: '#fbbf24' }}>{highScore}</span>
                </div>
            </div>

            {/* Game Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {gameState === 'ready' && (
                    <div className="glass-card animate-spring-in" style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ marginBottom: 16 }} className="animate-bounce">
                            <GameIcon name="spy" size={80} style={{ borderRadius: 16 }} />
                        </div>
                        <h2 className="animate-text-reveal" style={{ marginBottom: 8 }}>Find the Spy!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Cards will flip rapidly. Tap the spy card when you see it!
                        </p>
                        <button className="btn-primary animate-glow" onClick={startGame}>
                            Start Game
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div style={{ position: 'relative' }}>
                        {/* Feedback */}
                        {feedback && (
                            <div
                                className={feedback.type === 'success' ? 'animate-pop' : 'animate-shake'}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '2.5rem',
                                    fontWeight: 800,
                                    color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
                                    zIndex: 10,
                                    textShadow: '0 0 30px currentColor, 0 0 60px currentColor'
                                }}
                            >
                                {feedback.text}
                            </div>
                        )}

                        {/* Cards Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 12
                        }}>
                            {cards.map((card, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCardTap(index)}
                                    style={{
                                        aspectRatio: '1',
                                        background: 'transparent',
                                        border: revealedIndex === index ? '2px solid rgba(255,255,255,0.3)' : '1px solid var(--border)',
                                        borderRadius: 16,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        transform: revealedIndex === index ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: revealedIndex === index ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {revealedIndex === index
                                        ? <GameIcon name={card} size="100%" style={{ width: '100%', height: '100%', borderRadius: 14 }} />
                                        : <GameIcon name="unknown" size="100%" style={{ width: '100%', height: '100%', borderRadius: 14, opacity: 0.7 }} />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="glass-card animate-scale-in" style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ marginBottom: 16 }}>
                            <GameIcon name={score >= highScore && score > 0 ? 'trophy' : 'timer'} size={64} />
                        </div>
                        <h2 style={{ marginBottom: 8 }}>
                            {score >= highScore && score > 0 ? 'New High Score!' : 'Time\'s Up!'}
                        </h2>
                        <p style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: 8
                        }}>
                            {score} points
                        </p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                            Best: {highScore}
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
