import React, { useState, useEffect } from 'react';
import { Palette, X, Coins, Lock, Sparkles, Check } from 'lucide-react';
import { themes, applyTheme, loadSavedTheme } from '../themes';
import { useProgression } from '../contexts/ProgressionContext';

export default function ThemeSelector({ onClose }) {
    const [currentTheme, setCurrentTheme] = useState(loadSavedTheme());
    const { bits, isThemeOwned, purchaseTheme } = useProgression();
    const [purchaseResult, setPurchaseResult] = useState(null);

    const handleThemeChange = (themeName, theme) => {
        const owned = isThemeOwned(themeName, theme.price);

        if (!owned) {
            // Try to purchase
            const result = purchaseTheme(themeName, theme.price);
            if (result.success) {
                setPurchaseResult({ success: true, message: `Unlocked ${theme.name}!` });
                applyTheme(themeName);
                setCurrentTheme(themeName);
            } else {
                setPurchaseResult({ success: false, message: result.error });
            }
            setTimeout(() => setPurchaseResult(null), 2000);
        } else {
            applyTheme(themeName);
            setCurrentTheme(themeName);
        }
    };

    // Separate free and premium themes
    const freeThemes = Object.entries(themes).filter(([_, t]) => t.price === 0);
    const premiumThemes = Object.entries(themes).filter(([_, t]) => t.price > 0);

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
                maxWidth: 420,
                maxHeight: '85vh',
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

                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Palette size={40} color="var(--accent)" style={{ margin: '0 auto 12px', filter: 'drop-shadow(0 0 10px var(--accent))' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Themes</h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 8,
                        color: '#eab308',
                        fontSize: '0.9rem'
                    }}>
                        <Coins size={16} />
                        <span style={{ fontWeight: 600 }}>{bits} Bits</span>
                    </div>
                </div>

                {/* Purchase Result Toast */}
                {purchaseResult && (
                    <div className="animate-pop" style={{
                        padding: '10px 16px',
                        marginBottom: 16,
                        background: purchaseResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${purchaseResult.success ? '#10b981' : '#ef4444'}`,
                        borderRadius: 10,
                        textAlign: 'center',
                        color: purchaseResult.success ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}>
                        {purchaseResult.message}
                    </div>
                )}

                {/* Free Themes */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Free Themes
                    </p>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {freeThemes.map(([key, theme]) => {
                            const isSelected = currentTheme === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleThemeChange(key, theme)}
                                    style={{
                                        padding: 14,
                                        background: isSelected ? 'var(--accent-glow)' : 'rgba(0,0,0,0.2)',
                                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            fontWeight: 600,
                                            marginBottom: 4,
                                            color: isSelected ? 'var(--accent-light)' : 'var(--text-primary)'
                                        }}>
                                            {theme.name}
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {[theme.accent, theme.accentLight, theme.error].map((color, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '50%',
                                                        background: color,
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {isSelected && <Check size={18} color="var(--accent)" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Premium Animated Themes */}
                <div>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: 10,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}>
                        <Sparkles size={12} />
                        Premium Animated
                    </p>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {premiumThemes.map(([key, theme]) => {
                            const isSelected = currentTheme === key;
                            const owned = isThemeOwned(key, theme.price);

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleThemeChange(key, theme)}
                                    style={{
                                        padding: 14,
                                        background: isSelected
                                            ? 'var(--accent-glow)'
                                            : owned
                                                ? 'rgba(0,0,0,0.2)'
                                                : 'rgba(0,0,0,0.3)',
                                        border: `2px solid ${isSelected ? 'var(--accent)' : owned ? 'var(--border)' : theme.accent}`,
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Shimmer effect for premium */}
                                    {!owned && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '200%',
                                            height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${theme.accent}22, transparent)`,
                                            animation: 'shimmer 2s infinite'
                                        }} />
                                    )}

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            marginBottom: 4,
                                            color: isSelected ? 'var(--accent-light)' : theme.accentLight,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>
                                            {theme.name}
                                            {theme.animated && (
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    background: theme.accent,
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    color: '#fff'
                                                }}>
                                                    ANIMATED
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {[theme.accent, theme.accentLight, theme.error].map((color, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '50%',
                                                        background: color,
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        {owned ? (
                                            isSelected ? (
                                                <Check size={18} color="var(--accent)" />
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Owned</span>
                                            )
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                background: 'rgba(234, 179, 8, 0.2)',
                                                padding: '4px 10px',
                                                borderRadius: 8,
                                                border: '1px solid rgba(234, 179, 8, 0.4)'
                                            }}>
                                                <Coins size={14} color="#eab308" />
                                                <span style={{ fontWeight: 700, color: '#eab308', fontSize: '0.85rem' }}>
                                                    {theme.price}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
