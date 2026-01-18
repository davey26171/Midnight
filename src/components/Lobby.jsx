import React, { useState } from 'react';
import { Users, Plus, Play, X, Globe, Edit2, HelpCircle, ChevronDown, ChevronUp, Clock, Gamepad2, Target, Brain, Volume2, VolumeX, Trophy } from 'lucide-react';
import SpyDetector from './minigames/SpyDetector';
import MemoryAgent from './minigames/MemoryAgent';
import Achievements from './Achievements';
import { GameIcon } from '../icons';
import { useSound } from '../contexts/SoundContext';

export default function Lobby({ players, setPlayers, topic, setTopic, startGame, timer, setTimer, spyCount, setSpyCount, TOPICS, generateWordsFromTopic }) {
    const [customTopic, setCustomTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const [showMinigames, setShowMinigames] = useState(false);
    const [activeMinigame, setActiveMinigame] = useState(null);

    const { isMuted, toggleMute } = useSound();
    const [showAchievements, setShowAchievements] = useState(false);

    const addPlayer = () => {
        if (players.length < 16) {
            setPlayers([...players, `Player ${players.length + 1}`]);
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
    if (activeMinigame === 'spy-detector') {
        return <SpyDetector onClose={() => setActiveMinigame(null)} />;
    }
    if (activeMinigame === 'memory-agent') {
        return <MemoryAgent onClose={() => setActiveMinigame(null)} />;
    }

    return (
        <div className="screen-container">
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: 8, paddingTop: 16, position: 'relative' }}>
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
                    <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => setActiveMinigame('spy-detector')}
                            style={{
                                flex: 1,
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
                            <Target size={24} color="#ef4444" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Spy Detector</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Find the spy!</span>
                        </button>
                        <button
                            onClick={() => setActiveMinigame('memory-agent')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.1))',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Brain size={24} color="#6366f1" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Memory Agent</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match cards!</span>
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
        </div>
    );
}
