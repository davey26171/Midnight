import React, { useState } from 'react';
import { Gift, Check, X, Sparkles } from 'lucide-react';
import { useProgression } from '../contexts/ProgressionContext';

export default function RedeemCode({ onClose }) {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { redeemCode } = useProgression();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);

        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 800));

        const redemptionResult = redeemCode(code);
        setResult(redemptionResult);
        setIsLoading(false);

        if (redemptionResult.success) {
            setCode('');
        }
    };

    return (
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
                maxWidth: 400,
                width: '100%',
                padding: 24,
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
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

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-glow))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Gift size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Redeem Code</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                        Enter a special code to unlock exclusive cards!
                    </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter code..."
                        maxLength={20}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            fontSize: '1.1rem',
                            textAlign: 'center',
                            letterSpacing: '2px',
                            fontWeight: 700,
                            background: 'rgba(0,0,0,0.4)',
                            border: '2px solid var(--border)',
                            borderRadius: 12,
                            color: 'var(--text-primary)',
                            marginBottom: 16
                        }}
                    />

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!code.trim() || isLoading}
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Redeeming...' : 'Redeem'}
                    </button>
                </form>

                {/* Result Message */}
                {result && (
                    <div style={{
                        marginTop: 20,
                        padding: 16,
                        borderRadius: 12,
                        background: result.success
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${result.success ? 'var(--success)' : 'var(--error)'}`,
                        textAlign: 'center'
                    }}>
                        {result.success ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                                    <Sparkles size={20} color="var(--success)" />
                                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>Card Unlocked!</span>
                                </div>
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                    {result.card.name}
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                                    {result.card.description}
                                </p>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <X size={20} color="var(--error)" />
                                <span style={{ color: 'var(--error)' }}>{result.error}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
