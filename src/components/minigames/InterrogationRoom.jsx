import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Trophy, Timer, Zap } from 'lucide-react';

const QUESTIONS = [
    "Where were you last night?",
    "Do you know the victim?",
    "Can anyone verify your alibi?",
    "Why were you at the scene?",
    "What's in your pocket?",
    "Who else was there?",
    "When did you arrive?",
    "Have we met before?",
    "What's your real name?",
    "Why are you nervous?",
    "Can you explain this evidence?",
    "Where did you get that?",
    "Who sent you here?",
    "What are you hiding?",
    "Do you trust your partner?",
];

const ANSWERS = [
    "I was at home",
    "No comment",
    "I don't recall",
    "Yes, absolutely",
    "Maybe, I'm not sure",
    "That's classified",
    "I plead the fifth",
    "Ask my lawyer",
];

export default function InterrogationRoom({ onClose }) {
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3);
    const [pressureLevel, setPressureLevel] = useState(0);
    const [gameState, setGameState] = useState('ready'); // ready, playing, finished
    const [score, setScore] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [usedQuestions, setUsedQuestions] = useState([]);

    const MAX_QUESTIONS = 12;
    const TIME_PER_QUESTION = 3;

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) {
            // Time's up, score penalty
            setPressureLevel(prev => Math.min(100, prev + 15));
            nextQuestion();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setAnsweredCount(0);
        setPressureLevel(0);
        setUsedQuestions([]);
        nextQuestion();
    };

    const nextQuestion = () => {
        if (answeredCount >= MAX_QUESTIONS) {
            setGameState('finished');
            return;
        }

        // Get unused question
        const available = QUESTIONS.filter((_, i) => !usedQuestions.includes(i));
        if (available.length === 0) {
            setGameState('finished');
            return;
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        const qIndex = QUESTIONS.findIndex(q => q === available[randomIndex]);

        setCurrentQuestion(QUESTIONS[qIndex]);
        setUsedQuestions([...usedQuestions, qIndex]);
        setTimeLeft(TIME_PER_QUESTION);
        setQuestionIndex(prev => prev + 1);
    };

    const handleAnswer = (answer) => {
        if (gameState !== 'playing') return;

        // Score based on speed
        const speedBonus = timeLeft * 30;
        const points = 50 + speedBonus;
        setScore(prev => prev + points);
        setAnsweredCount(prev => prev + 1);

        // Reduce pressure if answered quickly
        if (timeLeft >= 2) {
            setPressureLevel(prev => Math.max(0, prev - 5));
        } else {
            setPressureLevel(prev => Math.min(100, prev + 10));
        }

        nextQuestion();
    };

    const suspicionScore = Math.max(0, 100 - score / 10);

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
                    <MessageSquare size={40} color="var(--accent-light)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Interrogation Room</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Answer rapid-fire questions under pressure
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
                        <h3 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Ready for Interrogation?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            You'll face {MAX_QUESTIONS} rapid questions. Answer quickly to keep your cool.
                            The faster you respond, the lower your suspicion level.
                        </p>
                        <button onClick={startGame} className="btn-primary animate-glow">
                            Begin Interrogation
                        </button>
                    </div>
                )}

                {/* Playing State */}
                {gameState === 'playing' && (
                    <>
                        {/* Progress */}
                        <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Question</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: 8 }}>
                                        {answeredCount + 1}/{MAX_QUESTIONS}
                                    </span>
                                </div>
                                <div style={{
                                    background: pressureLevel > 70 ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-glow)',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}>
                                    <Timer size={16} color={pressureLevel > 70 ? 'var(--error)' : 'var(--accent-light)'} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {Math.round(pressureLevel)}% Pressure
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                height: 6,
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(answeredCount / MAX_QUESTIONS) * 100}%`,
                                    background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="glass-card" style={{
                            padding: 20,
                            marginBottom: 20,
                            textAlign: 'center',
                            background: timeLeft === 1 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)'
                        }}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 900,
                                color: timeLeft === 1 ? 'var(--error)' : 'var(--accent-light)',
                                fontVariantNumeric: 'tabular-nums',
                                animation: timeLeft === 1 ? 'pulse 0.5s infinite' : 'none'
                            }}>
                                {timeLeft}
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="glass-card animate-scale-in" style={{
                            padding: 30,
                            marginBottom: 20,
                            textAlign: 'center',
                            border: '2px solid var(--accent)',
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <p style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.4
                            }}>
                                "{currentQuestion}"
                            </p>
                        </div>

                        {/* Answer Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {ANSWERS.slice(0, 4).map((answer, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(answer)}
                                    className="btn-secondary"
                                    style={{
                                        padding: '16px 12px',
                                        fontSize: '0.9rem',
                                        height: 'auto',
                                        minHeight: 60,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Finished State */}
                {gameState === 'finished' && (
                    <div className="modal-overlay">
                        <div className="glass-card animate-scale-in" style={{ maxWidth: 360, textAlign: 'center' }}>
                            <Trophy size={60} color="var(--accent-light)" style={{ margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Interrogation Complete</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                You've survived the questioning.
                            </p>

                            <div style={{
                                background: 'var(--accent-glow)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 12
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Final Score</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                                    {score}
                                </div>
                            </div>

                            <div style={{
                                background: suspicionScore < 30 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20,
                                border: `1px solid ${suspicionScore < 30 ? 'var(--success)' : 'var(--error)'}`
                            }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suspicion Level</div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: suspicionScore < 30 ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {Math.round(suspicionScore)}%
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                    {suspicionScore < 20 ? '✓ Cleared' : suspicionScore < 50 ? '⚠ Under Watch' : '🚨 Highly Suspect'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={startGame} className="btn-primary" style={{ flex: 1 }}>
                                    Retry
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
