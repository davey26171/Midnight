import React, { useState } from 'react';
import { Lock, Check, ChevronLeft, Sparkles } from 'lucide-react';
import { AGENT_CARDS, SPY_CARDS, DOUBLE_AGENT_CARDS, SPECIAL_CARDS, isCardUnlocked } from '../data/cardData';
import { useProgression } from '../contexts/ProgressionContext';

export default function CardCollection({ onBack }) {
    const [activeTab, setActiveTab] = useState('agent');
    const [selectedCard, setSelectedCard] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const { level, unlockedCards, equippedCards, equipCard } = useProgression();

    // Responsive Mobile Check
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { id: 'agent', label: 'Agents', cards: AGENT_CARDS },
        { id: 'spy', label: 'Spies', cards: SPY_CARDS },
        { id: 'doubleAgent', label: 'Double Agents', cards: DOUBLE_AGENT_CARDS },
    ];

    const currentCards = tabs.find(t => t.id === activeTab)?.cards || [];
    const isUnlocked = (card) => {
        const customUnlocked = unlockedCards?.[activeTab]?.includes(card.id);
        return customUnlocked || isCardUnlocked(card, level);
    };

    const isEquipped = (card) => equippedCards?.[activeTab] === card.id;

    const handleEquip = (card) => {
        if (isUnlocked(card)) {
            equipCard(activeTab, card.id);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    return (
        <div className="screen-container" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg-secondary)'
            }}>
                <button onClick={onBack} className="btn-icon">
                    <ChevronLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Card Collection</h2>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="var(--accent)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Level {level}</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
                overflowX: 'auto'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelectedCard(null); }}
                        style={{
                            flex: 1,
                            minWidth: 100,
                            padding: '12px 16px',
                            background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--accent-light)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Card Grid */}
                <div style={{
                    flex: 1,
                    padding: 16,
                    overflowY: 'auto',
                    paddingBottom: 100 // Space for bottom overlay if needed
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: 12
                    }}>
                        {currentCards.map(card => {
                            const unlocked = isUnlocked(card);
                            const equipped = isEquipped(card);
                            const isSelected = selectedCard?.id === card.id;

                            return (
                                <button
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '3/4',
                                        borderRadius: 12,
                                        border: isSelected
                                            ? '3px solid var(--accent)'
                                            : equipped
                                                ? '3px solid var(--success)'
                                                : '2px solid var(--border)',
                                        background: unlocked
                                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))'
                                            : 'rgba(0,0,0,0.4)',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                        padding: 0,
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            filter: unlocked ? 'none' : 'grayscale(100%) brightness(0.4)'
                                        }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />

                                    {/* Overlays */}
                                    {!unlocked && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0,0,0,0.6)'
                                        }}>
                                            <Lock size={24} color="var(--text-muted)" />
                                        </div>
                                    )}
                                    {equipped && (
                                        <div style={{
                                            position: 'absolute', top: 4, right: 4,
                                            width: 22, height: 22,
                                            background: 'var(--success)', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            zIndex: 5
                                        }}>
                                            <Check size={14} color="white" style={{ strokeWidth: 3 }} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Details Panel - Responsive Overlay for Mobile, Side Panel for Desktop */}
                {selectedCard && (
                    <div style={{
                        position: isMobile ? 'absolute' : 'relative',
                        inset: isMobile ? 0 : 'auto',
                        width: isMobile ? '100%' : 340,
                        background: isMobile ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.2)',
                        backdropFilter: isMobile ? 'blur(10px)' : 'none',
                        borderLeft: isMobile ? 'none' : '1px solid var(--border)',
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        zIndex: 20,
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {isMobile && (
                            <button
                                onClick={() => setSelectedCard(null)}
                                style={{
                                    position: 'absolute', top: 16, right: 16,
                                    background: 'rgba(255,255,255,0.1)', border: 'none',
                                    borderRadius: '50%', width: 36, height: 36,
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {/* Large Preview */}
                        <div
                            className={isAnimating ? 'animate-equip' : ''}
                            style={{
                                width: '100%',
                                maxWidth: 260,
                                aspectRatio: '3/4',
                                borderRadius: 20,
                                overflow: 'hidden',
                                border: `2px solid ${isEquipped(selectedCard) ? 'var(--success)' : 'var(--border)'}`,
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(15,23,42,0.8))',
                                marginBottom: 24,
                                boxShadow: isEquipped(selectedCard)
                                    ? '0 0 30px rgba(34, 197, 94, 0.2)'
                                    : '0 10px 30px rgba(0,0,0,0.3)'
                            }}
                        >
                            <img
                                src={selectedCard.image}
                                alt={selectedCard.name}
                                style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    filter: isUnlocked(selectedCard) ? 'none' : 'grayscale(100%) brightness(0.5)'
                                }}
                                onError={(e) => {
                                    e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">No Image</div>';
                                }}
                            />
                        </div>

                        {/* Info */}
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: 'white' }}>
                                {selectedCard.name}
                            </h3>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: 12,
                                background: 'rgba(255,255,255,0.1)',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                marginBottom: 16,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {selectedCard.rarity || 'COMMON'}
                            </div>

                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem',
                                marginBottom: 24,
                                lineHeight: 1.5,
                                maxWidth: '100%'
                            }}>
                                {selectedCard.description}
                            </p>

                            {/* Action Button */}
                            {isUnlocked(selectedCard) ? (
                                <button
                                    onClick={() => handleEquip(selectedCard)}
                                    className={`btn-primary ${isAnimating ? 'animate-equip' : ''}`}
                                    style={{
                                        width: '100%',
                                        background: isEquipped(selectedCard)
                                            ? 'linear-gradient(135deg, var(--success), #16a34a)'
                                            : 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                                    }}
                                >
                                    {isEquipped(selectedCard) ? (
                                        <><Check size={20} /> Equipped</>
                                    ) : (
                                        'Equip Card'
                                    )}
                                </button>
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    border: '1px solid var(--border)'
                                }}>
                                    <Lock size={16} color="var(--text-muted)" />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Unlocks at Level {selectedCard.unlockLevel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
