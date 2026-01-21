import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FRIEND_CODES, AGENT_CARDS, SPY_CARDS, DOUBLE_AGENT_CARDS } from '../data/cardData';
import {
    getOrCreatePlayerId,
    loadPlayerProgression,
    savePlayerProgression,
    subscribeToPlayerProgression
} from '../firebase';

const ProgressionContext = createContext();

const LOCAL_STORAGE_KEY = 'midnight_progression'; // For migration only

const defaultProgression = {
    bits: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    spyWins: 0,
    agentWins: 0,
    purchasedCards: {
        agent: ['agent_01'],
        spy: ['spy_01'],
        doubleAgent: ['da_default']
    },
    equippedCards: {
        agent: 'agent_01',
        spy: 'spy_01',
        doubleAgent: 'da_default'
    },
    purchasedThemes: [], // Premium themes purchased with bits
    redeemedCodes: [],
    customCards: []
};

export function ProgressionProvider({ children }) {
    const [progression, setProgression] = useState(defaultProgression);
    const [isLoading, setIsLoading] = useState(true);
    const [playerId, setPlayerId] = useState(null);
    const isInitialized = useRef(false);

    // Initialize: Load from Firebase, migrate from localStorage if needed
    useEffect(() => {
        const initializeProgression = async () => {
            const id = getOrCreatePlayerId();
            setPlayerId(id);

            try {
                // Try to load from Firebase first
                const firebaseData = await loadPlayerProgression(id);

                if (firebaseData) {
                    // Firebase has data - use it
                    console.log('[PROGRESSION] Loaded from Firebase:', id);
                    setProgression({ ...defaultProgression, ...firebaseData });
                } else {
                    // No Firebase data - check for localStorage migration
                    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        console.log('[PROGRESSION] Migrating localStorage to Firebase:', id);
                        await savePlayerProgression(id, { ...defaultProgression, ...parsed });
                        setProgression({ ...defaultProgression, ...parsed });
                        // Clear localStorage after migration
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    } else {
                        // Fresh user - save default to Firebase
                        console.log('[PROGRESSION] New player, creating Firebase entry:', id);
                        await savePlayerProgression(id, defaultProgression);
                        setProgression(defaultProgression);
                    }
                }
            } catch (error) {
                console.error('[PROGRESSION] Firebase error, falling back to defaults:', error);
                setProgression(defaultProgression);
            }

            isInitialized.current = true;
            setIsLoading(false);
        };

        initializeProgression();
    }, []);

    // Track our last saved timestamp to detect external changes
    const lastSavedTimestamp = useRef(0);

    // Subscribe to real-time Firebase updates (for admin console edits)
    useEffect(() => {
        if (!playerId || !isInitialized.current) return;

        console.log('[PROGRESSION] Setting up real-time listener for:', playerId);

        const unsubscribe = subscribeToPlayerProgression(playerId, (firebaseData) => {
            const incomingTimestamp = firebaseData?.lastUpdated || 0;

            // If incoming data has a newer timestamp than our last save, it's an external edit
            if (incomingTimestamp > lastSavedTimestamp.current) {
                console.log('[PROGRESSION] Real-time update from Firebase (external edit detected)', {
                    incoming: incomingTimestamp,
                    lastSaved: lastSavedTimestamp.current
                });
                setProgression(prev => ({ ...defaultProgression, ...firebaseData }));
                lastSavedTimestamp.current = incomingTimestamp;
            }
        });

        return () => unsubscribe();
    }, [playerId]);

    // Save to Firebase on progression change
    useEffect(() => {
        if (!playerId || !isInitialized.current || isLoading) return;

        const saveToFirebase = async () => {
            const timestamp = Date.now();
            lastSavedTimestamp.current = timestamp; // Mark this as our save
            await savePlayerProgression(playerId, { ...progression, lastUpdated: timestamp });
        };

        saveToFirebase();
    }, [progression, playerId, isLoading]);

    // Add bits
    const addBits = (amount) => {
        setProgression(prev => ({ ...prev, bits: prev.bits + amount }));
    };

    // Record game result - award bits based on role
    const recordGame = (won, wasSpy) => {
        setProgression(prev => {
            const bitsEarned = won ? (wasSpy ? 100 : 75) : 25;
            return {
                ...prev,
                bits: prev.bits + bitsEarned,
                gamesPlayed: prev.gamesPlayed + 1,
                gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
                spyWins: (won && wasSpy) ? prev.spyWins + 1 : prev.spyWins,
                agentWins: (won && !wasSpy) ? prev.agentWins + 1 : prev.agentWins
            };
        });
    };

    // Purchase a card with bits
    const purchaseCard = (type, cardId, price) => {
        if (progression.bits < price) {
            return { success: false, error: 'Not enough Bits!' };
        }
        if (progression.purchasedCards[type]?.includes(cardId)) {
            return { success: false, error: 'Already owned!' };
        }

        setProgression(prev => ({
            ...prev,
            bits: prev.bits - price,
            purchasedCards: {
                ...prev.purchasedCards,
                [type]: [...(prev.purchasedCards[type] || []), cardId]
            }
        }));
        return { success: true };
    };

    // Check if card is owned
    const isCardOwned = (type, cardId) => {
        return progression.purchasedCards[type]?.includes(cardId) || false;
    };

    // Equip a card
    const equipCard = (type, cardId) => {
        if (!isCardOwned(type, cardId)) return;
        setProgression(prev => ({
            ...prev,
            equippedCards: {
                ...prev.equippedCards,
                [type]: cardId
            }
        }));
    };

    // Redeem a friend code
    const redeemCode = (code) => {
        const upperCode = code.toUpperCase().trim();

        if (progression.redeemedCodes.includes(upperCode)) {
            return { success: false, error: 'Code already redeemed!' };
        }

        // Special Global Code
        if (upperCode === 'MIDNIGHTBIT') {
            setProgression(prev => ({
                ...prev,
                redeemedCodes: [...prev.redeemedCodes, upperCode],
                bits: prev.bits + 2000
            }));
            return {
                success: true,
                card: { name: '2,000 Special Bits' } // Dummy card object for display
            };
        }

        const codeData = FRIEND_CODES[upperCode];
        if (!codeData) {
            return { success: false, error: 'Invalid code!' };
        }

        setProgression(prev => ({
            ...prev,
            redeemedCodes: [...prev.redeemedCodes, upperCode],
            customCards: [...prev.customCards, codeData],
            purchasedCards: {
                ...prev.purchasedCards,
                [codeData.type]: [...(prev.purchasedCards[codeData.type] || []), codeData.cardId]
            }
        }));

        return { success: true, card: codeData };
    };

    // Get collection stats
    const getCollectionStats = () => {
        const totalCards = AGENT_CARDS.length + SPY_CARDS.length + DOUBLE_AGENT_CARDS.length;
        const ownedCards =
            (progression.purchasedCards.agent?.length || 0) +
            (progression.purchasedCards.spy?.length || 0) +
            (progression.purchasedCards.doubleAgent?.length || 0);
        const percentage = Math.round((ownedCards / totalCards) * 100);
        return { ownedCards, totalCards, percentage };
    };

    // Check if theme is owned (free themes are always owned)
    const isThemeOwned = (themeId, themePrice) => {
        if (themePrice === 0) return true;
        return progression.purchasedThemes?.includes(themeId) || false;
    };

    // Purchase a premium theme
    const purchaseTheme = (themeId, price) => {
        if (isThemeOwned(themeId, price)) {
            return { success: false, error: 'Theme already owned!' };
        }
        if (progression.bits < price) {
            return { success: false, error: 'Not enough bits!' };
        }

        setProgression(prev => ({
            ...prev,
            bits: prev.bits - price,
            purchasedThemes: [...(prev.purchasedThemes || []), themeId]
        }));
        return { success: true };
    };

    const value = {
        ...progression,
        isLoading,
        playerId,
        addBits,
        recordGame,
        purchaseCard,
        isCardOwned,
        equipCard,
        redeemCode,
        getCollectionStats,
        isThemeOwned,
        purchaseTheme
    };

    return (
        <ProgressionContext.Provider value={value}>
            {children}
        </ProgressionContext.Provider>
    );
}

export function useProgression() {
    const context = useContext(ProgressionContext);
    if (!context) {
        throw new Error('useProgression must be used within a ProgressionProvider');
    }
    return context;
}

export default ProgressionContext;
