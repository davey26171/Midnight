import React, { useState } from 'react';
import { Users, Plus, Play, X, Globe, Edit2, HelpCircle, ChevronDown, ChevronUp, Clock, Gamepad2, Lock, Activity, Search, MessageSquare, Trophy, Volume2, VolumeX, MessageCircle, AlertTriangle, FileText, ArrowLeft, Palette, Bookmark, UserPlus } from 'lucide-react';
import CodeBreaker from './minigames/CodeBreaker';
import LieDetector from './minigames/LieDetector';
import EvidenceCollection from './minigames/EvidenceCollection';
import InterrogationRoom from './minigames/InterrogationRoom';
import Achievements from './Achievements';
import ThemeSelector from './ThemeSelector';
import { GameIcon } from '../icons';
import { useSound } from '../contexts/SoundContext';

const SAVED_PLAYERS_KEY = 'midnight_singleplayer_names';
const SAVED_NAMES_KEY = 'midnight_saved_names_list';

export default function Lobby({ players, setPlayers, topic, setTopic, startGame, timer, setTimer, spyCount, setSpyCount, gameMode, setGameMode, TOPICS, generateWordsFromTopic, onBack }) {
    const [customTopic, setCustomTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const [showMinigames, setShowMinigames] = useState(false);
    const [showGameModes, setShowGameModes] = useState(false);
    const [activeMinigame, setActiveMinigame] = useState(null);

    const { isMuted, toggleMute } = useSound();
    const [showAchievements, setShowAchievements] = useState(false);
    const [showThemes, setShowThemes] = useState(false);

    // Saved names feature
    const [savedNames, setSavedNames] = useState(() => {
        try {
            const saved = localStorage.getItem(SAVED_NAMES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [showSavedNames, setShowSavedNames] = useState(false);

    // Save saved names to localStorage
    React.useEffect(() => {
        localStorage.setItem(SAVED_NAMES_KEY, JSON.stringify(savedNames));
    }, [savedNames]);

    // Save a player name to saved names list
    const saveNameToList = (name) => {
        if (!savedNames.includes(name)) {
            setSavedNames([...savedNames, name]);
        }
    };

    // Add a saved name to current players
    const addFromSaved = (name) => {
        if (players.length < 16 && !players.includes(name)) {
            setPlayers([...players, name]);
        }
        setShowSavedNames(false);
    };

    // Remove from saved names
    const removeFromSaved = (name) => {
        setSavedNames(savedNames.filter(n => n !== name));
    };

    const addPlayer = () => {
        if (players.length < 16) {
            // Generate unique player name
            let num = players.length + 1;
            let newName = `Player ${num}`;
            while (players.includes(newName)) {
                num++;
                newName = `Player ${num}`;
            }
            setPlayers([...players, newName]);
        }
    };

    const removePlayer = (index) => {
        setPlayers(players.filter((_, i) => i !== index));
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditValue(players[index]);
    };

    const saveEdit = () => {
        if (editValue.trim()) {
            const updated = [...players];
            updated[editingIndex] = editValue.trim();
            setPlayers(updated);
        }
        setEditingIndex(null);
        setEditValue('');
    };

    const handleStart = async () => {
        if (topic === 'Custom' && customTopic.trim()) {
            setIsGenerating(true);
            const words = await generateWordsFromTopic(customTopic.trim());
            setIsGenerating(false);
            if (words) {
                startGame(words);
            }
        } else {
            startGame();
        }
    };

    // Minigame check
    if (activeMinigame === 'code-breaker') {
        return <CodeBreaker onClose={() => setActiveMinigame(null)} />;
    }
    if (activeMinigame === 'lie-detector') {
        return <LieDetector onClose={() => setActiveMinigame(null)} />;
    }
    if (activeMinigame === 'evidence-collection') {
        return <EvidenceCollection onClose={() => setActiveMinigame(null)} />;
    }
    if (activeMinigame === 'interrogation-room') {
        return <InterrogationRoom onClose={() => setActiveMinigame(null)} />;
    }

    return (
        <div className="screen-container">
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: 8, paddingTop: 16, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: 0 }}>
                    <button
                        onClick={() => onBack && onBack()}
                        className="btn-secondary"
                        style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => setShowAchievements(true)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'var(--accent-light)',
                            padding: 8,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Trophy size={20} />
                    </button>
                    <button
                        onClick={toggleMute}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'var(--text-muted)',
                            padding: 8,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={() => setShowThemes(true)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'var(--accent-light)',
                            padding: 8,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Palette size={20} />
                    </button>
                </div>

                <div className="animate-spring-in" style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 40px var(--accent-glow)',
                    border: '2px solid var(--border)'
                }}>
                    <img
                        src="/logo.png"
                        alt="Midnight"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <h1 className="animate-text-reveal" style={{
                    fontSize: '2rem',
                    marginBottom: 6,
                    background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px var(--accent-glow)'
                }}>
                    MIDNIGHT
                </h1>
                <p className="animate-fade-in stagger-1" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                    Social Deduction Game
                </p>
            </header>

            {/* Tutorial Toggle */}
            <button
                className="btn-secondary"
                onClick={() => setShowTutorial(!showTutorial)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={16} />
                    How to Play
                </span>
                {showTutorial ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTutorial && (
                <div className="glass-card animate-fade-in" style={{ padding: '16px 18px', marginTop: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { icon: Users, title: 'Add Players', desc: 'Add 3-16 players' },
                            { icon: Globe, title: 'Choose Topic', desc: 'AI generates fresh words each game' },
                            { icon: HelpCircle, title: 'Find the Spy', desc: 'Discuss and vote out the imposter' },
                            { icon: Clock, title: 'Beat the Clock', desc: 'Find the spy before time runs out' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }} className={`animate-fade-in stagger-${i + 1}`}>
                                <div style={{
                                    padding: 8,
                                    background: 'var(--accent-glow)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <item.icon size={16} color="var(--accent-light)" />
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.title}</strong>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Game Mode Selector */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
                <button
                    onClick={() => setShowGameModes(!showGameModes)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={18} color="var(--accent-light)" />
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Game Modes</span>
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            background: 'var(--accent-glow)',
                            borderRadius: 10,
                            color: 'var(--accent-light)'
                        }}>
                            {gameMode === 'classic' ? '⭐ Classic' :
                                gameMode === 'doubleagent' ? '🎭 Double Agent' :
                                    gameMode === 'assassin' ? '🗡️ Assassin' : '🌀 Chaos'}
                        </span>
                    </div>
                    {showGameModes ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>

                {showGameModes && (
                    <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            onClick={() => setGameMode('classic')}
                            style={{
                                padding: 14,
                                background: gameMode === 'classic' ? 'var(--accent-glow)' : 'rgba(0,0,0,0.2)',
                                border: `1px solid ${gameMode === 'classic' ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4, color: gameMode === 'classic' ? 'var(--accent-light)' : 'var(--text-primary)' }}>
                                ⭐ Classic
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                1 spy vs agents
                            </div>
                        </button>
                        <button
                            onClick={() => setGameMode('doubleagent')}
                            style={{
                                padding: 14,
                                background: gameMode === 'doubleagent' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.2)',
                                border: `1px solid ${gameMode === 'doubleagent' ? '#a855f7' : 'var(--border)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4, color: gameMode === 'doubleagent' ? '#a855f7' : 'var(--text-primary)' }}>
                                🎭 Double Agent
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Spy + hidden ally
                            </div>
                        </button>
                        <button
                            onClick={() => setGameMode('assassin')}
                            style={{
                                padding: 14,
                                background: gameMode === 'assassin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.2)',
                                border: `1px solid ${gameMode === 'assassin' ? '#ef4444' : 'var(--border)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4, color: gameMode === 'assassin' ? '#ef4444' : 'var(--text-primary)' }}>
                                🗡️ Assassin
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Spy can eliminate 1
                            </div>
                        </button>
                        <button
                            onClick={() => setGameMode('chaos')}
                            style={{
                                padding: 14,
                                background: gameMode === 'chaos' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.2)',
                                border: `1px solid ${gameMode === 'chaos' ? '#f59e0b' : 'var(--border)'}`,
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4, color: gameMode === 'chaos' ? '#f59e0b' : 'var(--text-primary)' }}>
                                🌀 Chaos
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Random roles each round
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Minigames Section */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
                <button
                    onClick={() => setShowMinigames(!showMinigames)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Gamepad2 size={18} color="var(--accent-light)" />
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Minigames</span>
                    </div>
                    {showMinigames ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showMinigames && (
                    <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            onClick={() => setActiveMinigame('code-breaker')}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Lock size={24} color="#a78bfa" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Code Breaker</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pattern puzzle</span>
                        </button>
                        <button
                            onClick={() => setActiveMinigame('lie-detector')}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Activity size={24} color="#ef4444" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Lie Detector</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick reactions</span>
                        </button>
                        <button
                            onClick={() => setActiveMinigame('evidence-collection')}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Search size={24} color="#10b981" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Evidence Hunt</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Find clues</span>
                        </button>
                        <button
                            onClick={() => setActiveMinigame('interrogation-room')}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <MessageSquare size={24} color="#f59e0b" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Interrogation</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rapid answers</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Players Section */}
            <div className="glass-card" style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} color="var(--accent-light)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Players</h3>
                        <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-elevated)',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontWeight: 600
                        }}>
                            {players.length}/{players.length >= 3 ? '16' : '3'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                        {/* Saved Names Dropdown Button */}
                        <button
                            onClick={() => setShowSavedNames(!showSavedNames)}
                            disabled={savedNames.length === 0}
                            style={{
                                background: savedNames.length > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 10px',
                                cursor: savedNames.length > 0 ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                opacity: savedNames.length === 0 ? 0.4 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Bookmark size={16} color="var(--text-secondary)" />
                            {savedNames.length > 0 && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)'
                                }}>
                                    {savedNames.length}
                                </span>
                            )}
                        </button>

                        {/* Saved Names Dropdown */}
                        {showSavedNames && savedNames.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 4,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: 8,
                                minWidth: 180,
                                zIndex: 100,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
                            }}>
                                {savedNames.map((name, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span
                                            onClick={() => addFromSaved(name)}
                                            style={{ flex: 1, fontSize: '0.9rem' }}
                                        >
                                            {name}
                                        </span>
                                        <X
                                            size={14}
                                            onClick={(e) => { e.stopPropagation(); removeFromSaved(name); }}
                                            style={{ opacity: 0.5, cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            onClick={addPlayer}
                            disabled={players.length >= 16}
                            style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
                        >
                            <Plus size={16} />
                            Add
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {players.map((name, i) => (
                        <div
                            key={i}
                            className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {editingIndex === i ? (
                                <input
                                    className="glass-input"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                    autoFocus
                                    style={{ padding: '4px 8px', flex: 1, marginRight: 8, fontSize: '0.9rem' }}
                                />
                            ) : (
                                <span
                                    onClick={() => startEditing(i)}
                                    style={{
                                        cursor: 'pointer',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {name}
                                    <Edit2 size={12} style={{ opacity: 0.3 }} />
                                </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* Save to list button */}
                                <Bookmark
                                    size={16}
                                    onClick={() => saveNameToList(name)}
                                    fill={savedNames.includes(name) ? 'var(--accent)' : 'none'}
                                    color={savedNames.includes(name) ? 'var(--accent)' : 'currentColor'}
                                    style={{
                                        cursor: 'pointer',
                                        opacity: savedNames.includes(name) ? 1 : 0.3,
                                        flexShrink: 0,
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <X
                                    size={16}
                                    onClick={() => removePlayer(i)}
                                    style={{
                                        cursor: 'pointer',
                                        opacity: 0.3,
                                        flexShrink: 0,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.3}
                                />
                            </div>
                        </div>
                    ))}
                    {players.length === 0 && (
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            padding: 20,
                            fontSize: '0.85rem',
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px dashed var(--border)'
                        }}>
                            Tap "Add" to add players
                        </p>
                    )}
                </div>
            </div>

            {/* Settings Card */}
            <div className="glass-card" style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Globe size={18} color="var(--accent-light)" />
                    <h2 style={{ fontSize: '1rem' }}>Topic</h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {Object.keys(TOPICS).map(t => (
                        <button
                            key={t}
                            className={`tag ${topic === t ? 'active' : ''}`}
                            onClick={() => setTopic(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {topic === 'Custom' && (
                    <input
                        className="glass-input animate-fade-in"
                        placeholder="Enter any topic..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        style={{ marginBottom: 14 }}
                    />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timer:</span>
                        <select
                            className="glass-input"
                            value={timer}
                            onChange={(e) => setTimer(Number(e.target.value))}
                            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                            <option value={120}>2 Min</option>
                            <option value={300}>5 Min</option>
                            <option value={480}>8 Min</option>
                            <option value={600}>10 Min</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={14} style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spies:</span>
                        <select
                            className="glass-input"
                            value={spyCount}
                            onChange={(e) => setSpyCount(Number(e.target.value))}
                            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
                            disabled={players.length < 3}
                        >
                            {Array.from({ length: Math.max(1, Math.floor(players.length / 2)) }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <button
                className={`btn-primary ${players.length >= 3 && !isGenerating ? 'animate-glow' : ''}`}
                onClick={handleStart}
                disabled={players.length < 3 || isGenerating || (topic === 'Custom' && !customTopic.trim())}
            >
                {isGenerating ? (
                    <>
                        <GameIcon name="sparkle" size={18} className="animate-pulse" />
                        Generating words...
                    </>
                ) : (
                    <>
                        <Play size={18} />
                        Start Game
                    </>
                )}
            </button>

            {players.length < 3 && (
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--error)',
                    marginTop: -8,
                    fontWeight: 500
                }}>
                    Need at least 3 players
                </p>
            )}

            {showAchievements && <Achievements onClose={() => setShowAchievements(false)} />}
            {showThemes && <ThemeSelector onClose={() => setShowThemes(false)} />}
        </div>
    );
}
