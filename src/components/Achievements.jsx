import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Activity, X } from 'lucide-react';

export default function Achievements({ onClose }) {
    const [stats, setStats] = useState({ played: 0, spyWins: 0, agentWins: 0 });
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        try {
            const savedStats = JSON.parse(localStorage.getItem('midnight_stats') || '{"played":0,"spyWins":0,"agentWins":0}');
            setStats(savedStats);
            calculateBadges(savedStats);
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    }, []);

    const calculateBadges = (s) => {
        const earned = [];
        if (s.played >= 1) earned.push({ id: 'novice', name: 'Rookie Agent', desc: 'Played your first game', icon: Activity });
        if (s.played >= 10) earned.push({ id: 'veteran', name: 'Veteran', desc: 'Played 10 games', icon: Medal });
        if (s.spyWins >= 1) earned.push({ id: 'spy_novice', name: 'Shadow Walker', desc: 'Won as Spy', icon: Crown });
        if (s.spyWins >= 5) earned.push({ id: 'spy_master', name: 'Mastermind', desc: 'Won 5 games as Spy', icon: Trophy });
        if (s.agentWins >= 5) earned.push({ id: 'detective', name: 'True Detective', desc: 'Won 5 games as Agent', icon: Shield });

        setBadges(earned);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
        }}>
            <div className="glass-card animate-scale-in" style={{
                width: '100%',
                maxWidth: 400,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Trophy size={48} color="var(--accent)" style={{ margin: '0 auto 16px', filter: 'drop-shadow(0 0 10px var(--accent))' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Career Profile</h2>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    marginBottom: 32
                }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{stats.played}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Played</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{stats.spyWins}</div>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase' }}>Spy Wins</div>
                    </div>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>{stats.agentWins}</div>
                        <div style={{ fontSize: '0.7rem', color: '#818cf8', textTransform: 'uppercase' }}>Agent Wins</div>
                    </div>
                </div>

                {/* Badges */}
                <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Earned Badges</h3>
                {badges.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No badges earned yet. Play more games!
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {badges.map((badge, i) => (
                            <div
                                key={badge.id}
                                className={`animate-fade-in stagger-${i}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    padding: 12,
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)',
                                    borderRadius: 12,
                                    borderLeft: '4px solid var(--accent)'
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'var(--accent-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <badge.icon size={20} color="var(--accent-light)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'white' }}>{badge.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{badge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Shield({ size, color, style }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    )
}
