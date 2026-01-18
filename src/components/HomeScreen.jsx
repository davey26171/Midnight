import React, { useState } from 'react';
import { Play, BookOpen, RotateCcw } from 'lucide-react';

export default function HomeScreen({ onStartGame, onContinue, hasSavedGame }) {
    const [showRules, setShowRules] = useState(false);

    return (
        <div className="screen-container" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'cover',
                    zIndex: 0
                }}
            >
                <source src="/home.mp4" type="video/mp4" />
            </video>

            {/* Vignette Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(ellipse at center, transparent 20%, rgba(10, 11, 20, 0.6) 60%, rgba(10, 11, 20, 0.95) 100%),
                    linear-gradient(to bottom, rgba(10, 11, 20, 0.4) 0%, transparent 25%, transparent 55%, rgba(10, 11, 20, 0.95) 100%)
                `,
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
            }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 20,
                    marginBottom: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                            src="/logo.png"
                            alt="Midnight"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                            }}
                        />
                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #fff, #c4b5fd)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em'
                        }}>
                            MIDNIGHT
                        </h1>
                    </div>
                </header>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Menu Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    paddingBottom: 20
                }}>
                    {hasSavedGame && (
                        <button
                            onClick={onContinue}
                            className="animate-fade-in"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                border: 'none',
                                borderRadius: 16,
                                padding: '18px 24px',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                fontFamily: "'DM Sans', sans-serif",
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            <RotateCcw size={20} />
                            Continue Game
                        </button>
                    )}

                    <button
                        onClick={onStartGame}
                        className="animate-fade-in stagger-1"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            borderRadius: 16,
                            padding: '18px 24px',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <Play size={20} />
                        Start New Game
                    </button>

                    <button
                        onClick={() => setShowRules(true)}
                        className="animate-fade-in stagger-2"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: 16,
                            padding: '18px 24px',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <BookOpen size={20} />
                        Read Rules
                    </button>
                </div>

                {/* Credits */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.3)',
                    paddingBottom: 16,
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                    2026 © Dave Jacob
                </p>
            </div>

            {/* Rules Modal */}
            {showRules && (
                <div
                    onClick={() => setShowRules(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24
                    }}
                >
                    <div
                        className="animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 380,
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            padding: 24,
                            background: 'rgba(24, 26, 40, 0.95)',
                            borderRadius: 24,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <h2 style={{
                            fontSize: '1.5rem',
                            marginBottom: 20,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #fff, #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            How to Play
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { num: '1', title: 'Setup', desc: 'Add 3-16 players and choose a topic.' },
                                { num: '2', title: 'Roles', desc: 'One player is the Spy. Others see the secret word.' },
                                { num: '3', title: 'Discuss', desc: 'Take turns asking questions about the word.' },
                                { num: '4', title: 'Find Spy', desc: 'Spy blends in. Others try to identify them.' },
                                { num: '5', title: 'Vote', desc: 'Vote on who the Spy is before time runs out!' }
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{step.title}</strong>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 2 }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            style={{
                                width: '100%',
                                marginTop: 24,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 12,
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
