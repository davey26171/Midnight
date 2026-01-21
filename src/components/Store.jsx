import React, { useState } from 'react';
import { ChevronLeft, Coins, Gift, Check, Lock, ShoppingBag, Sparkles, X } from 'lucide-react';
import { AGENT_CARDS, SPY_CARDS, DOUBLE_AGENT_CARDS, RARITY, getCardPrice, getRarityInfo } from '../data/cardData';
import { useProgression } from '../contexts/ProgressionContext';
import './Store.css';

export default function Store({ onBack }) {
    const [activeTab, setActiveTab] = useState('agent');
    const [selectedCard, setSelectedCard] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [showRedeem, setShowRedeem] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemResult, setRedeemResult] = useState(null);

    const {
        bits,
        purchasedCards,
        equippedCards,
        purchaseCard,
        equipCard,
        isCardOwned,
        redeemCode: doRedeemCode,
        getCollectionStats
    } = useProgression();

    const tabs = [
        { id: 'agent', label: 'Agents', cards: AGENT_CARDS },
        { id: 'spy', label: 'Spies', cards: SPY_CARDS },
        { id: 'doubleAgent', label: 'Double Agents', cards: DOUBLE_AGENT_CARDS },
    ];

    const currentCards = tabs.find(t => t.id === activeTab)?.cards || [];
    const { ownedCards, totalCards, percentage } = getCollectionStats();

    const [purchasingId, setPurchasingId] = useState(null);
    const [bitsSpent, setBitsSpent] = useState(null);

    // ... (lines 15-34 remain the same)

    const handlePurchase = async (card) => {
        const price = getCardPrice(card);
        setPurchasingId(card.id);

        // Wait for sequential shatter animation (1.25s shards + 1.5s card rise + buffer)
        await new Promise(resolve => setTimeout(resolve, 3500));

        const result = purchaseCard(activeTab, card.id, price);
        if (result.success) {
            setSelectedCard({ ...card, justPurchased: true });
            setBitsSpent({ amount: price, id: card.id });
            setTimeout(() => setBitsSpent(null), 1000);
        }
        setPurchasingId(null);
    };

    const handleRedeem = (e) => {
        e.preventDefault();
        const result = doRedeemCode(redeemCode);
        setRedeemResult(result);
        if (result.success) setRedeemCode('');
    };

    return (
        <div className="screen-container" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 10,
                        padding: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ChevronLeft size={22} color="var(--text-primary)" />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Store</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {percentage}% Collection ({ownedCards}/{totalCards})
                    </p>
                </div>
                <div style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.1))',
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: '1px solid rgba(234,179,8,0.3)'
                }}>
                    <Coins size={18} color="#eab308" />
                    <span style={{ fontWeight: 700, color: '#eab308' }}>{bits}</span>
                </div>
            </div>

            {/* Tabs + Redeem Button */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelectedCard(null); setImageError(false); }}
                        style={{
                            flex: 1,
                            padding: '12px 8px',
                            background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--accent-light)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
                <button
                    onClick={() => setShowRedeem(true)}
                    style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid transparent',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Gift size={16} /> Redeem
                </button>
            </div>

            {/* Main Content */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                height: 'calc(100vh - 160px)'
            }}>
                {/* Left Panel - Card Grid */}
                <div
                    className="store-grid-container"
                    style={{
                        flex: 1,
                        padding: 16,
                        borderRight: '1px solid var(--border)'
                    }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                        gap: 10
                    }}>
                        {currentCards.map(card => {
                            const owned = isCardOwned(activeTab, card.id);
                            const equipped = equippedCards?.[activeTab] === card.id;
                            const rarityInfo = getRarityInfo(card.rarity);
                            const price = getCardPrice(card);

                            const isPurchasing = purchasingId === card.id;

                            return (
                                <button
                                    key={card.id}
                                    className={`store-card-btn ${isPurchasing ? 'animate-unlock' : ''} ${selectedCard?.id === card.id ? 'selected' : ''} ${equipped ? 'equipped' : ''}`}
                                    onClick={() => { setSelectedCard(card); setImageError(false); }}
                                    disabled={isPurchasing}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '3/4',
                                        borderRadius: 10,
                                        border: selectedCard?.id === card.id
                                            ? `2px solid ${rarityInfo.color}`
                                            : equipped
                                                ? '2px solid var(--success)'
                                                : '2px solid var(--border)',
                                        background: selectedCard?.id === card.id
                                            ? `linear-gradient(135deg, ${rarityInfo.color}33, ${rarityInfo.color}11)`
                                            : owned
                                                ? `linear-gradient(135deg, ${rarityInfo.color}15, ${rarityInfo.color}08)`
                                                : 'rgba(0,0,0,0.4)',
                                        cursor: isPurchasing ? 'wait' : 'pointer',
                                        overflow: 'hidden',
                                        padding: 0
                                    }}
                                >
                                    {/* Bits Spent Particle */}
                                    {bitsSpent?.id === card.id && (
                                        <div className="bits-spent-particle">
                                            -{bitsSpent.amount}
                                        </div>
                                    )}
                                    {/* Fallback placeholder with card name */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${rarityInfo.color}22, rgba(15,23,42,0.9))`,
                                        fontSize: '0.6rem',
                                        color: rarityInfo.color,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        padding: 4
                                    }}>
                                        {card.name.split(' ').slice(1).join(' ') || card.name}
                                    </div>
                                    {/* Actual image - overlays placeholder when loaded */}
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            filter: owned ? 'none' : 'grayscale(100%) brightness(0.4)'
                                        }}
                                    />

                                    {/* Rarity indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        background: rarityInfo.color
                                    }} />

                                    {!owned && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0,0,0,0.5)'
                                        }}>
                                            <Lock size={18} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.6rem', color: rarityInfo.color, marginTop: 2, fontWeight: 700 }}>
                                                {price} <Coins size={8} style={{ verticalAlign: 'middle' }} />
                                            </span>
                                        </div>
                                    )}

                                    {equipped && (
                                        <div style={{
                                            position: 'absolute', top: 4, right: 4,
                                            width: 20, height: 20,
                                            background: 'var(--success)', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: 0,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            zIndex: 2
                                        }}>
                                            <Check size={12} color="white" style={{ strokeWidth: 3 }} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel - Card Preview */}
                <div style={{
                    width: 280,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    {selectedCard ? (() => {
                        const rarityInfo = getRarityInfo(selectedCard.rarity);
                        const price = getCardPrice(selectedCard);
                        const owned = isCardOwned(activeTab, selectedCard.id);

                        return (
                            <>
                                <div style={{
                                    width: '100%',
                                    maxWidth: 180,
                                    aspectRatio: '3/4',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    border: `3px solid ${rarityInfo.color}`,
                                    background: `linear-gradient(135deg, ${rarityInfo.color}33, rgba(15,23,42,0.8))`,
                                    marginBottom: 12,
                                    boxShadow: `0 0 20px ${rarityInfo.color}44`
                                }}>
                                    {imageError ? (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.8rem'
                                        }}>
                                            No Image
                                        </div>
                                    ) : (
                                        <img
                                            src={selectedCard.image}
                                            alt={selectedCard.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                filter: owned ? 'none' : 'grayscale(100%) brightness(0.5)'
                                            }}
                                            onError={() => setImageError(true)}
                                        />
                                    )}
                                </div>

                                {/* Rarity Badge */}
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    background: `${rarityInfo.color}22`,
                                    border: `1px solid ${rarityInfo.color}`,
                                    marginBottom: 8
                                }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: rarityInfo.color, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {rarityInfo.name}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
                                    {selectedCard.name}
                                </h3>

                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.8rem',
                                    textAlign: 'center',
                                    marginBottom: 16,
                                    lineHeight: '1.4',
                                    minHeight: '2.8em', // Allow approx 2 lines
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {selectedCard.description}
                                </p>

                                {owned ? (
                                    <button
                                        onClick={() => equipCard(activeTab, selectedCard.id)}
                                        className={equippedCards?.[activeTab] === selectedCard.id ? 'btn-secondary' : 'btn-primary'}
                                        style={{ width: '100%' }}
                                    >
                                        {equippedCards?.[activeTab] === selectedCard.id ? (
                                            <><Check size={16} /> Equipped</>
                                        ) : (
                                            'Equip Card'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(selectedCard)}
                                        className="btn-primary"
                                        disabled={bits < price}
                                        style={{
                                            width: '100%',
                                            opacity: bits < price ? 0.5 : 1,
                                            background: bits >= price ? `linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color}cc)` : undefined
                                        }}
                                    >
                                        <ShoppingBag size={16} />
                                        Buy for {price} <Coins size={14} style={{ marginLeft: 4 }} />
                                    </button>
                                )}
                            </>
                        );
                    })() : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            textAlign: 'center'
                        }}>
                            Select a card to preview
                        </div>
                    )}
                </div>
            </div>

            {/* Redeem Code Modal */}
            {showRedeem && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 20
                }}>
                    <div className="glass-card animate-spring-in" style={{
                        maxWidth: 360,
                        width: '100%',
                        padding: 24,
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => { setShowRedeem(false); setRedeemResult(null); }}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Gift size={40} color="var(--accent)" style={{ marginBottom: 12 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Redeem Code</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Enter a special code for free cards!
                            </p>
                        </div>

                        <form onSubmit={handleRedeem}>
                            <input
                                type="text"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                placeholder="Enter code..."
                                maxLength={20}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    letterSpacing: '2px',
                                    fontWeight: 700,
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '2px solid var(--border)',
                                    borderRadius: 10,
                                    color: 'var(--text-primary)',
                                    marginBottom: 12
                                }}
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={!redeemCode.trim()}>
                                Redeem
                            </button>
                        </form>

                        {redeemResult && (
                            <div style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 10,
                                background: redeemResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                border: `1px solid ${redeemResult.success ? 'var(--success)' : 'var(--error)'}`,
                                textAlign: 'center'
                            }}>
                                {redeemResult.success ? (
                                    <>
                                        <Sparkles size={18} color="var(--success)" style={{ marginBottom: 4 }} />
                                        <p style={{ fontWeight: 600, color: 'var(--success)' }}>Unlocked: {redeemResult.card.name}</p>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--error)' }}>{redeemResult.error}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Purchase Animation Overlay */}
            {purchasingId && selectedCard && (
                <div className="purchase-overlay">
                    <div className="purchase-card-container">
                        {/* The Actual Card (Revealed from behind) */}
                        <div className="purchase-card-revealed">
                            <img
                                src={selectedCard.image}
                                alt="Unlocked"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                padding: 16,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                textAlign: 'center',
                                borderRadius: '0 0 16px 16px'
                            }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
                                    ACQUIRED
                                </h3>
                            </div>
                        </div>

                        {/* The Shell (Shatters into 8 pieces) */}
                        <div className="purchase-shell">
                            <div className="shard shard-1">
                                <Lock size={40} color="var(--accent)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                            </div>
                            <div className="shard shard-2" />
                            <div className="shard shard-3" />
                            <div className="shard shard-4" />
                            <div className="shard shard-5" />
                            <div className="shard shard-6" />
                            <div className="shard shard-7" />
                            <div className="shard shard-8" />
                            {/* Debris particles */}
                            <div className="debris debris-1" />
                            <div className="debris debris-2" />
                            <div className="debris debris-3" />
                            <div className="debris debris-4" />
                            <div className="debris debris-5" />
                        </div>

                        {/* Flash effect on shatter */}
                        <div className="shatter-flash" />
                    </div>
                </div>
            )}
        </div>
    );
}
