import React, { useState, useEffect, useRef } from 'react';
import { Timer, MessageCircle, Send, X, Vote, Eye, EyeOff, Users } from 'lucide-react';
import { subscribeToRoom, sendMessage, updateGamePhase } from '../firebase';

export default function MultiplayerGameBoard({ roomCode, playerName, gameData, players, timer = 300 }) {
    const [timeLeft, setTimeLeft] = useState(timer);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showWord, setShowWord] = useState(false);
    const chatEndRef = useRef(null);

    const playerRole = gameData?.roleMap?.[playerName] || 'agent';
    const isSpy = playerRole === 'spy' || playerRole === 'assassin';
    const isInnocent = playerRole === 'innocent';
    const canSeeWord = !isSpy && !isInnocent;

    // Subscribe to room for chat messages
    useEffect(() => {
        if (!roomCode) return;

        const unsubscribe = subscribeToRoom(roomCode, (data) => {
            if (data?.messages) {
                const msgArr = Object.entries(data.messages)
                    .map(([id, msg]) => ({ id, ...msg }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                setMessages(msgArr);
            }
        });

        return unsubscribe;
    }, [roomCode]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !roomCode) return;
        await sendMessage(roomCode, playerName, newMessage.trim());
        setNewMessage('');
    };

    const handleVote = async () => {
        if (roomCode) {
            // Send system message
            await sendMessage(roomCode, 'SYSTEM', `${playerName} has asked to start voting!`);
            // Give it a tiny moment to propagate before switching phase
            setTimeout(() => {
                updateGamePhase(roomCode, 'VOTING');
            }, 500);
        }
    };

    const isLowTime = timeLeft < 30;
    const progressPercent = (timeLeft / timer) * 100;

    return (
        <div className="screen-container" style={{ position: 'relative' }}>
            {/* Timer Card */}
            <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className={isLowTime ? 'animate-pulse' : ''} style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: isLowTime ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Timer size={24} color={isLowTime ? 'var(--error)' : 'var(--accent-light)'} />
                        </div>
                        <span style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            color: isLowTime ? 'var(--error)' : 'var(--text-primary)',
                            fontVariantNumeric: 'tabular-nums'
                        }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="btn-secondary"
                            style={{ padding: '10px 12px' }}
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            onClick={handleVote}
                            className="btn-primary"
                            style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                        >
                            <Vote size={18} /> Vote!
                        </button>
                    </div>
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
                        transition: 'width 1s linear'
                    }} />
                </div>
            </div>

            {/* Players */}
            <div className="glass-card" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Users size={18} color="var(--accent)" />
                    <span style={{ fontWeight: 600 }}>Players ({players.length})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {players.map((p) => (
                        <div
                            key={p}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 8,
                                background: p === playerName ? 'var(--accent-glow)' : 'rgba(0,0,0,0.2)',
                                border: p === playerName ? '1px solid var(--accent)' : '1px solid var(--border)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {p} {p === playerName && '(You)'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Word Reminder */}
            {canSeeWord && (
                <div
                    className="glass-card"
                    onClick={() => setShowWord(!showWord)}
                    style={{
                        marginTop: 24,
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        borderColor: showWord ? 'var(--accent)' : 'var(--border)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '8px 0' }}>
                        {showWord ? (
                            <>
                                <EyeOff size={18} color="var(--accent-light)" />
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{gameData.word}</span>
                            </>
                        ) : (
                            <>
                                <Eye size={18} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)' }}>Tap to see secret word</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Panel - Fixed Drawer */}
            {showChat && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    width: '100%',
                    maxWidth: 480, // Match typical game width
                    height: '50vh',
                    background: 'var(--bg-primary)',
                    borderTop: '1px solid var(--border)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageCircle size={18} color="var(--accent)" />
                            <span style={{ fontWeight: 600 }}>Chat</span>
                        </div>
                        <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                            <X size={20} color="var(--text-muted)" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {messages.length === 0 ? (
                            <div style={{ hieght: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                No messages yet
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} style={{ marginBottom: 12 }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: msg.player === 'SYSTEM' ? 'var(--accent)' : (msg.player === playerName ? 'var(--accent-light)' : 'var(--text-primary)'),
                                        fontSize: '0.75rem',
                                        display: 'block',
                                        marginBottom: 2
                                    }}>
                                        {msg.player === 'SYSTEM' ? 'GAME' : msg.player}
                                    </span>
                                    <p style={{
                                        color: msg.player === 'SYSTEM' ? 'var(--accent)' : 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        background: msg.player === 'SYSTEM' ? 'var(--accent-glow)' : 'transparent',
                                        padding: msg.player === 'SYSTEM' ? '4px 8px' : 0,
                                        borderRadius: 4,
                                        display: 'inline-block'
                                    }}>
                                        {msg.text}
                                    </p>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-secondary)' }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            maxLength={100}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: 20,
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="btn-primary"
                            style={{ padding: '0 14px', borderRadius: 20 }}
                            disabled={!newMessage.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
