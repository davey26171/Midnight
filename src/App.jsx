import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameEngineProvider } from './GameEngine';
import { SoundProvider, useSound } from './contexts/SoundContext';
import { ProgressionProvider } from './contexts/ProgressionContext';
import HomeScreen from './components/HomeScreen';
import Lobby from './components/Lobby';
import RoleReveal from './components/RoleReveal';
import GameBoard from './components/GameBoard';
import VotingScreen from './components/VotingScreen';
import Results from './components/Results';
import { Eye, Target, Fingerprint } from 'lucide-react';

// Cinematic Spy-Themed Splash Screen
function SplashScreen({ onComplete }) {
    const [phase, setPhase] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [showElements, setShowElements] = useState({
        scanlines: false,
        logo: false,
        text: false,
        classified: false,
        progress: false
    });

    const fullText = "CLASSIFIED OPERATION";

    // Typewriter effect
    useEffect(() => {
        if (phase >= 2 && typedText.length < fullText.length) {
            const timer = setTimeout(() => {
                setTypedText(fullText.slice(0, typedText.length + 1));
            }, 80);
            return () => clearTimeout(timer);
        }
    }, [phase, typedText]);

    // Phase progression
    useEffect(() => {
        const timers = [
            setTimeout(() => setShowElements(prev => ({ ...prev, scanlines: true })), 100),
            setTimeout(() => setPhase(1), 500),
            setTimeout(() => setShowElements(prev => ({ ...prev, logo: true })), 600),
            setTimeout(() => setPhase(2), 1200),
            setTimeout(() => setShowElements(prev => ({ ...prev, text: true })), 1300),
            setTimeout(() => setShowElements(prev => ({ ...prev, classified: true })), 2000),
            setTimeout(() => setShowElements(prev => ({ ...prev, progress: true })), 2500),
            setTimeout(() => setPhase(3), 2600),
            setTimeout(onComplete, 4000)
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#050508',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            {/* Scanlines overlay */}
            {showElements.scanlines && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                    pointerEvents: 'none',
                    opacity: 0.5,
                    animation: 'fadeIn 0.5s ease'
                }} />
            )}

            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'pulse 3s ease-in-out infinite'
            }} />

            {/* Floating icons */}
            <div style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                opacity: showElements.logo ? 0.1 : 0,
                transition: 'opacity 1s ease',
                animation: 'float 4s ease-in-out infinite'
            }}>
                <Eye size={48} color="var(--accent)" />
            </div>
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '15%',
                opacity: showElements.logo ? 0.1 : 0,
                transition: 'opacity 1s ease',
                animation: 'float 5s ease-in-out infinite reverse'
            }}>
                <Target size={40} color="var(--accent)" />
            </div>
            <div style={{
                position: 'absolute',
                top: '25%',
                right: '25%',
                opacity: showElements.text ? 0.08 : 0,
                transition: 'opacity 1s ease',
                animation: 'float 6s ease-in-out infinite'
            }}>
                <Fingerprint size={56} color="var(--accent)" />
            </div>

            {/* Main content */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
                {/* Logo with reveal animation */}
                <div style={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 32px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    transform: showElements.logo ? 'scale(1)' : 'scale(0.8)',
                    opacity: showElements.logo ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: showElements.classified
                        ? '0 0 80px rgba(99, 102, 241, 0.5), 0 0 120px rgba(99, 102, 241, 0.3)'
                        : '0 20px 60px rgba(0,0,0,0.5)',
                    border: '2px solid rgba(99, 102, 241, 0.5)'
                }}>
                    <img
                        src="/logo.png"
                        alt="Midnight"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Classified text */}
                <div style={{
                    opacity: showElements.text ? 1 : 0,
                    transform: showElements.text ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.5s ease'
                }}>
                    <p style={{
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        marginBottom: 8,
                        fontWeight: 500,
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                        {typedText}
                        <span style={{
                            opacity: typedText.length < fullText.length ? 1 : 0,
                            animation: 'pulse 0.5s infinite'
                        }}>_</span>
                    </p>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #fff 0%, #6366f1 50%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 8,
                    letterSpacing: '-0.02em',
                    opacity: showElements.logo ? 1 : 0,
                    transform: showElements.logo ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
                }}>
                    MIDNIGHT
                </h1>

                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.9rem',
                    marginBottom: 48,
                    opacity: showElements.text ? 1 : 0,
                    transition: 'opacity 0.5s ease 0.3s',
                    letterSpacing: '0.1em'
                }}>
                    SOCIAL DEDUCTION GAME
                </p>

                {/* TOP SECRET stamp - overlays everything */}
                {showElements.classified && (
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-12deg)',
                        zIndex: 100,
                        animation: 'stampIn 0.3s ease',
                        pointerEvents: 'none',
                        opacity: 0.85
                    }}>
                        {/* Circular stamp design */}
                        <div style={{
                            position: 'relative',
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            border: '8px double rgba(220, 38, 38, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.02) 60%, transparent 70%)',
                            boxShadow: '0 0 30px rgba(220, 38, 38, 0.15)',
                            filter: 'contrast(1.1) brightness(1.05)'
                        }}>
                            {/* Inner border */}
                            <div style={{
                                position: 'absolute',
                                inset: '12px',
                                borderRadius: '50%',
                                border: '3px solid rgba(220, 38, 38, 0.5)'
                            }} />

                            {/* Text */}
                            <div style={{
                                textAlign: 'center',
                                transform: 'rotate(2deg)'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.25em',
                                    color: 'rgba(220, 38, 38, 0.75)',
                                    marginBottom: '4px',
                                    fontFamily: 'monospace'
                                }}>
                                    ★ TOP ★
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.15em',
                                    color: 'rgba(220, 38, 38, 0.8)',
                                    textShadow: '1px 1px 2px rgba(220, 38, 38, 0.3)',
                                    fontFamily: 'monospace'
                                }}>
                                    SECRET
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    color: 'rgba(220, 38, 38, 0.7)',
                                    marginTop: '2px',
                                    fontFamily: 'monospace'
                                }}>
                                    CLASSIFIED
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Progress indicator */}
                {showElements.progress && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{
                            width: 200,
                            height: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 1,
                            overflow: 'hidden',
                            margin: '0 auto'
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                                borderRadius: 1,
                                animation: 'loadingBar 1.5s ease forwards',
                                boxShadow: '0 0 10px var(--accent)'
                            }} />
                        </div>
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.7rem',
                            marginTop: 16,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 500,
                            letterSpacing: '0.08em'
                        }}>
                            Initializing secure connection...
                        </p>
                    </div>
                )}
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes stampIn {
                    0% { transform: translate(-50%, -50%) rotate(-15deg) scale(2); opacity: 0; }
                    100% { transform: translate(-50%, -50%) rotate(-15deg) scale(1); opacity: 1; }
                }
                @keyframes loadingBar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}

function AppContent({ gameState, setGameState, continueGame, hasSavedGame, ...props }) {
    const { playMusic, playSfx } = useSound();

    // Handle background music based on game state
    useEffect(() => {
        if (gameState === 'HOME' || gameState === 'LOBBY') {
            playMusic('menuMusic');
        } else if (gameState === 'PLAYING') {
            playMusic('gameMusic');
        } else if (gameState === 'REVEAL') {
            playMusic('suspenseMusic');
        }
    }, [gameState, playMusic]);

    // Handle SFX for screen transitions
    useEffect(() => {
        playSfx('transition');
    }, [gameState, playSfx]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={gameState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            >
                {(() => {
                    switch (gameState) {
                        case 'HOME':
                            return (
                                <HomeScreen
                                    onStartGame={() => setGameState('LOBBY')}
                                    onContinue={continueGame}
                                    hasSavedGame={hasSavedGame}
                                    onMultiplayerStart={(data) => {
                                        // Set multiplayer game data and start
                                        if (props.setPlayers) props.setPlayers(data.players);
                                        if (props.setGameData) props.setGameData(data.gameData);
                                        setGameState('REVEAL');
                                    }}
                                />
                            );
                        case 'LOBBY':
                            return <Lobby {...props} setGameState={setGameState} onBack={() => setGameState('HOME')} />;
                        case 'REVEAL':
                            return <RoleReveal {...props} setGameState={setGameState} />;
                        case 'PLAYING':
                            return <GameBoard {...props} setGameState={setGameState} />;
                        case 'VOTING':
                            return <VotingScreen {...props} setGameState={setGameState} />;
                        case 'RESULTS_SPY_WIN':
                            return <Results winner="SPY" {...props} resetGame={() => setGameState('HOME')} />;
                        case 'RESULTS_AGENTS_WIN':
                            return <Results winner="AGENTS" {...props} resetGame={() => setGameState('HOME')} />;
                        default:
                            return (
                                <HomeScreen
                                    onStartGame={() => setGameState('LOBBY')}
                                    onContinue={continueGame}
                                    hasSavedGame={hasSavedGame}
                                />
                            );
                    }
                })()}
            </motion.div>
        </AnimatePresence>
    );
}

function App() {
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    return (
        <SoundProvider>
            <ProgressionProvider>
                <GameEngineProvider>
                    <AppContent />
                </GameEngineProvider>
            </ProgressionProvider>
        </SoundProvider>
    );
}

export default App;
