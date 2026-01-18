import React from 'react';
import { Shield, Users, Clock, Sparkles } from 'lucide-react';

export default function GameInfoSidebar() {
    return (
        <div className="game-info-sidebar">
            <div className="glass-card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>How to Play</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Users size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Add Players</strong>
                            <p>Add 3-16 players for local multiplayer</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Sparkles size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Choose Topic</strong>
                            <p>Select preset or enter custom topic for AI generation</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Shield size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Find the Spy</strong>
                            <p>One player is the spy. Others know the secret word</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Clock size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Time Limit</strong>
                            <p>Vote before time runs out!</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Game Features</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        <span>AI-powered word generation</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        <span>Up to 16 players</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        <span>Customizable timer</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        <span>Pass-and-play design</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
