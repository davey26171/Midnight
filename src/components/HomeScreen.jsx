import React, { useState } from 'react';
import { Play, RotateCcw, Users, ShoppingBag } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import MultiplayerGame from './MultiplayerGame';
import Store from './Store';

export default function HomeScreen({ onStartGame, onContinue, hasSavedGame, onMultiplayerStart }) {
    const [showThemes, setShowThemes] = useState(false);
    const [showMultiplayer, setShowMultiplayer] = useState(false);
    const [showStore, setShowStore] = useState(false);

    if (showMultiplayer) {
        return (
            <MultiplayerGame
                onBack={() => setShowMultiplayer(false)}
            />
        );
    }

    if (showStore) {
        return (
            <Store
                onBack={() => setShowStore(false)}
            />
        );
    }

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
                            background: 'linear-gradient(135deg, var(--text-primary), var(--accent-light))',
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
                        onClick={() => setShowMultiplayer(true)}
                        className="animate-fade-in stagger-2"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <Users size={20} />
                        Multiplayer
                    </button>

                    {/* Store Button */}
                    <button
                        onClick={() => setShowStore(true)}
                        className="animate-fade-in stagger-4"
                        style={{
                            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                            border: 'none',
                            borderRadius: 16,
                            padding: '16px 24px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3)',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <ShoppingBag size={18} />
                        Store
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

            {/* Theme Selector */}
            {showThemes && <ThemeSelector onClose={() => setShowThemes(false)} />}
        </div>
    );
}
