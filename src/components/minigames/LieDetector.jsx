import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, ArrowLeft, Trophy, Zap, Award } from 'lucide-react';

const STATEMENTS = [
    { text: "Spies always work alone", isTrue: false },
    { text: "Trust is the spy's greatest weakness", isTrue: true },
    { text: "Agents never make mistakes", isTrue: false },
    { text: "Deception requires quick thinking", isTrue: true },
    { text: "All suspects are guilty", isTrue: false },
    { text: "Evidence can be misleading", isTrue: true },
    { text: "Perfect alibis don't exist", isTrue: true },
    { text: "Lies are always obvious", isTrue: false },
    { text: "Observation beats assumption", isTrue: true },
    { text: "Every word is the truth", isTrue: false },
    { text: "Patience reveals the truth", isTrue: true },
    { text: "Spies never feel pressure", isTrue: false },
    { text: "Body language tells stories", isTrue: true },
    { text: "Everyone is trustworthy", isTrue: false },
    { text: "Details expose deception", isTrue: true },
];

export default function LieDetector({ onClose }) {
    const [currentStatement, setCurrentStatement] = useState(null);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [gameState, setGameState] = useState('ready'); // ready, playing, result, finished
    const [feedback, setFeedback] = useState('');
    const [streak, setStreak] = useState(0);
    const [reactionTime, setReactionTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [heartbeat, setHeartbeat] = useState(60);
    const [usedStatements, setUsedStatements] = useState([]);

    const TOTAL_ROUNDS = 10;

    // Heartbeat animation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setHeartbeat(prev => 60 + Math.random() * 40);
        }, 800);

        return () => clearInterval(interval);
    }, [gameState]);

    const startGame = () => {
        setScore(0);
        setRound(0);
        setStreak(0);
        setUsedStatements([]);
        nextRound();
    };

    const nextRound = () => {
        if (round >= TOTAL_ROUNDS) {
            setGameState('finished');
            return;
        }

        // Get unused statement
        const available = STATEMENTS.filter((_, i) => !usedStatements.includes(i));
        const randomIndex = Math.floor(Math.random() * available.length);
        const statementIndex = STATEMENTS.findIndex(s => s === available[randomIndex]);

        setCurrentStatement(STATEMENTS[statementIndex]);
        setUsedStatements([...usedStatements, statementIndex]);
        setGameState('playing');
        setRound(prev => prev + 1);
        setStartTime(Date.now());
        setFeedback('');
    };

    const handleAnswer = (userAnswer) => {
        if (gameState !== 'playing') return;

        const timeTaken = Date.now() - startTime;
        setReactionTime(timeTaken);

        const isCorrect = userAnswer === currentStatement.isTrue;

        if (isCorrect) {
            const timeBonus = Math.max(0, 100 - Math.floor(timeTaken / 10));
            const points = 100 + timeBonus + (streak * 20);
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            setFeedback(`Correct! +${points} pts`);
        } else {
            setStreak(0);
            setFeedback('Wrong!');
        }

        setGameState('result');
        setTimeout(() => {
            nextRound();
        }, 1500);
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
                    <Activity size={40} color="var(--accent-light)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Lie Detector</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Identify truth from lies as fast as you can
                    </p>
                </div>

                {/* Ready State */}
                {gameState === 'ready' && (
                    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            margin: '0 auto 20px',
                            borderRadius: '50%',
                            background: 'var(--accent-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Zap size={40} color="var(--accent-light)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Ready to Test Your Instincts?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            You'll see {TOTAL_ROUNDS} statements. Quickly identify if they're TRUE or FALSE.
                            Speed and accuracy both matter!
                        </p>
                        <button onClick={startGame} className="btn-primary animate-glow">
                            Start Test
                        </button>
                    </div>
                )}

                {/* Playing State */}
                {(gameState === 'playing' || gameState === 'result') && (
                    <>
                        {/* Progress */}
                        <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Round</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: 8 }}>{round}/{TOTAL_ROUNDS}</span>
                                </div>
                                {streak > 0 && (
                                    <div style={{
                                        background: 'var(--accent-glow)',
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}>
                                        <Award size={16} color="var(--accent-light)" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            {streak}x Streak
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{
                                height: 6,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(round / TOTAL_ROUNDS) * 100}%`,
                                    background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>

                        {/* Heartbeat Monitor */}
                        <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <Activity size={20} color="var(--error)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stress Level</span>
                                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{
                                        position: 'absolute',
                                        height: '100%',
                                        width: '30%',
                                        background: 'var(--error)',
                                        animation: 'pulse 0.8s ease-in-out infinite',
                                        boxShadow: '0 0 10px var(--error)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{Math.floor(heartbeat)} BPM</span>
                            </div>
                        </div>

                        {/* Statement Card */}
                        <div className="glass-card animate-scale-in" style={{
                            padding: 40,
                            marginBottom: 20,
                            textAlign: 'center',
                            border: gameState === 'result' ? '2px solid var(--accent)' : '1px solid var(--border)',
                            minHeight: 180,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <p style={{
                                fontSize: '1.25rem',
                                lineHeight: 1.6,
                                color: 'var(--text-primary)',
                                marginBottom: 20
                            }}>
                                "{currentStatement?.text}"
                            </p>

                            {feedback && (
                                <div className="animate-scale-in" style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: feedback.includes('Correct') ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {feedback}
                                </div>
                            )}
                        </div>

                        {/* Answer Buttons */}
                        {gameState === 'playing' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <button
                                    onClick={() => handleAnswer(true)}
                                    className="btn-primary"
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        padding: '20px',
                                        fontSize: '1.1rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <CheckCircle size={24} />
                                    TRUE
                                </button>
                                <button
                                    onClick={() => handleAnswer(false)}
                                    className="btn-primary"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        padding: '20px',
                                        fontSize: '1.1rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <XCircle size={24} />
                                    FALSE
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Finished State */}
                {gameState === 'finished' && (
                    <div className="modal-overlay">
                        <div className="glass-card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }}>
                            <Trophy size={60} color="var(--accent-light)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Analysis Complete!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                Your lie detection skills have been evaluated.
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
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                                    {score > 1500 ? '🏆 Master Detective' : score > 1000 ? '⭐ Expert Analyst' : score > 500 ? '✓ Good Instincts' : '📚 Keep Practicing'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={startGame} className="btn-primary" style={{ flex: 1 }}>
                                    Test Again
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
