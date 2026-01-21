import React, { useState, useEffect } from 'react';

const TOPICS = {
    "Places": ["Hospital", "Space Station", "Submarine", "University", "Movie Studio", "Circus", "Polar Station"],
    "Jobs": ["Astronaut", "Surgeon", "Chef", "Spy", "Detective", "Pilot", "Diver", "Shadow Agent"],
    "Animals": ["Octopus", "Chameleon", "Falcon", "Panther", "Owl", "Cobra", "Shark"],
    "Custom": []
};

const STORAGE_KEY = 'midnight_game_save';

// Save game state to localStorage
const saveGame = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save game:', e);
    }
};

// Load game state from localStorage
const loadGame = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load game:', e);
        return null;
    }
};

// Clear saved game
const clearSavedGame = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear save:', e);
    }
};

// Check if there's a saved game
const hasSavedGame = () => {
    return loadGame() !== null;
};


// Input sanitization to prevent XSS and injection attacks
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .slice(0, 50) // Limit length
        .replace(/[<>\"']/g, '') // Remove dangerous characters
        .replace(/\s+/g, ' '); // Normalize whitespace
};

// AI-powered word generation using Groq API (Llama 3.1 8B Instant - free and fast)
const generateWordsFromTopic = async (topicInput, excludeList = []) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    // SECURITY: Validate API key exists
    if (!apiKey || apiKey === 'your_api_key_here') {
        console.error('Missing API Key! Please set VITE_GROQ_API_KEY in your .env file.');
        alert('API Configuration Error: Missing API Key. Check console for details.');
        return null;
    }

    // SECURITY: Sanitize user input to prevent prompt injection
    const sanitizedTopic = sanitizeInput(topicInput);
    if (!sanitizedTopic || sanitizedTopic.length < 2) {
        alert('Please enter a valid topic (at least 2 characters).');
        return null;
    }

    try {
        console.log('Requesting words for topic:', sanitizedTopic);

        const excludeStr = excludeList.length > 0
            ? `Do NOT include any of these previously used words: ${excludeList.join(', ')}.`
            : '';

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{
                    role: 'user',
                    // SECURITY: Use sanitized input in prompt
                    content: `Generate exactly 8 precise examples that belong to the category "${sanitizedTopic}". 
                    STRICTLY instances of the category, not just related concepts. (e.g. if category is 'Countries', return 'France', not 'Paris'. if category is 'Colors', return 'Blue', not 'Sky').
                    ${excludeStr}
                    Return ONLY the items as a comma-separated list, nothing else.`
                }],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', response.status, errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content.trim() : '';

        if (!text) {
            console.error('Empty response from AI');
            return null;
        }

        // Parse the comma-separated words
        const words = text.split(',').map(w => w.trim()).filter(w => w);
        console.log('Generated words:', words);
        return words.length > 0 ? words : null;
    } catch (error) {
        console.error('AI generation failed with error:', error);
        alert(`AI Generation Failed: ${error.message}. Check console for details.`);
        return null;
    }
};


export const GameEngineProvider = ({ children }) => {
    const [gameState, setGameState] = useState('HOME');
    const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3']);
    const [originalPlayers, setOriginalPlayers] = useState([]);
    const [topic, setTopic] = useState('Places');
    const [customWord, setCustomWord] = useState('');
    const [timer, setTimer] = useState(300);
    const [spyCount, setSpyCount] = useState(1);
    const [gameMode, setGameMode] = useState('classic');
    const [wordHistory, setWordHistory] = useState([]); // Track used words
    const [gameData, setGameData] = useState({
        spies: [],
        doubleAgent: null,
        word: '',
        revealedCount: 0,
        roleMap: {}
    });

    // Save game when entering PLAYING state
    useEffect(() => {
        if (gameState === 'PLAYING') {
            saveGame({
                players,
                topic,
                timer,
                spyCount,
                gameData,
                gameState: 'PLAYING'
            });
        }
        // Handle Game End & Stats
        if (gameState.startsWith('RESULTS_')) {
            clearSavedGame();

            // Restore original players so they're not missing in next game
            if (originalPlayers.length > 0) {
                setPlayers(originalPlayers);
            }

            // Update Stats
            try {
                const stats = JSON.parse(localStorage.getItem('midnight_stats') || '{"played":0,"spyWins":0,"agentWins":0}');
                stats.played += 1;
                if (gameState === 'RESULTS_SPY_WIN') stats.spyWins += 1;
                if (gameState === 'RESULTS_AGENTS_WIN') stats.agentWins += 1;
                localStorage.setItem('midnight_stats', JSON.stringify(stats));
            } catch (e) {
                console.error('Failed to update stats', e);
            }
        }
    }, [gameState]); // Removed other dependencies to prevent multiple triggers (logic check: gameState change is main trigger)

    const startGame = (customTopicWords = []) => {
        // Clear any previous save
        clearSavedGame();

        // Store original player roster for restoration after game ends
        setOriginalPlayers([...players]);

        let activeWords = customTopicWords.length > 0 ? customTopicWords : TOPICS[topic];
        if (activeWords.length === 0) return;

        // Filter out recently used words
        const availableWords = activeWords.filter(w => !wordHistory.includes(w));

        // If all words used, fall back to full list (or maybe just recycle oldest? for now full list)
        const candidates = availableWords.length > 0 ? availableWords : activeWords;

        const randomWord = candidates[Math.floor(Math.random() * candidates.length)];

        // Update history (keep last 20)
        setWordHistory(prev => {
            const newHistory = [...prev, randomWord];
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });

        let currentSpies = [];
        let doubleAgent = null;
        let assassinTarget = null;
        let roleMap = {};

        // Role assignment based on game mode
        if (gameMode === 'classic') {
            // Classic mode: 1 spy
            let availableIndices = Array.from({ length: players.length }, (_, i) => i);
            const spyIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            currentSpies.push(players[spyIndex]);
            roleMap[players[spyIndex]] = 'spy';
            availableIndices = availableIndices.filter(i => i !== spyIndex);

            // Assign remaining players as agents
            availableIndices.forEach(idx => {
                roleMap[players[idx]] = 'agent';
            });
        } else if (gameMode === 'multispy') {
            // Multiple Spies: 2+ spies
            const effectiveSpyCount = spyCount;
            let availableIndices = Array.from({ length: players.length }, (_, i) => i);

            for (let i = 0; i < effectiveSpyCount; i++) {
                if (availableIndices.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableIndices.length);
                const spyIndex = availableIndices[randomIndex];
                currentSpies.push(players[spyIndex]);
                roleMap[players[spyIndex]] = 'spy';
                availableIndices.splice(randomIndex, 1);
            }

            // Assign remaining players as agents
            availableIndices.forEach(idx => {
                roleMap[players[idx]] = 'agent';
            });
        } else if (gameMode === 'doubleagent') {
            // Double Agent mode: 1 spy + 1 double agent (appears as agent but helps spy)
            let availableIndices = Array.from({ length: players.length }, (_, i) => i);

            // Pick spy
            const spyIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            currentSpies.push(players[spyIndex]);
            roleMap[players[spyIndex]] = 'spy';
            availableIndices = availableIndices.filter(i => i !== spyIndex);

            // Pick double agent
            const daIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            doubleAgent = players[daIndex];
            roleMap[players[daIndex]] = 'doubleagent';
            availableIndices = availableIndices.filter(i => i !== daIndex);

            // Assign remaining as agents
            availableIndices.forEach(idx => {
                roleMap[players[idx]] = 'agent';
            });
        } else if (gameMode === 'assassin') {
            // Assassin mode: 1 spy who can eliminate 1 player silently
            let availableIndices = Array.from({ length: players.length }, (_, i) => i);
            const spyIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            currentSpies.push(players[spyIndex]);
            roleMap[players[spyIndex]] = 'assassin';
            availableIndices = availableIndices.filter(i => i !== spyIndex);

            // Assign remaining players as agents
            availableIndices.forEach(idx => {
                roleMap[players[idx]] = 'agent';
            });
        } else if (gameMode === 'chaos') {
            // Chaos mode: Random mix of roles
            let availableIndices = Array.from({ length: players.length }, (_, i) => i);

            // Always 1 spy
            const spyIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            currentSpies.push(players[spyIndex]);
            roleMap[players[spyIndex]] = 'spy';
            availableIndices = availableIndices.filter(i => i !== spyIndex);

            // Maybe add 1 double agent (50% chance)
            if (availableIndices.length > 1 && Math.random() > 0.5) {
                const daIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                doubleAgent = players[daIndex];
                roleMap[players[daIndex]] = 'doubleagent';
                availableIndices = availableIndices.filter(i => i !== daIndex);
            }

            // Maybe add 1 innocent (doesn't know word, 30% chance)
            if (availableIndices.length > 1 && Math.random() > 0.7) {
                const innocentIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                roleMap[players[innocentIndex]] = 'innocent';
                availableIndices = availableIndices.filter(i => i !== innocentIndex);
            }

            // Assign remaining as agents
            availableIndices.forEach(idx => {
                roleMap[players[idx]] = 'agent';
            });
        }

        setGameData({
            spies: currentSpies,
            doubleAgent,
            assassinTarget,
            word: randomWord,
            revealedCount: 0,
            roleMap
        });
        setGameState('REVEAL');
    };

    const continueGame = () => {
        const saved = loadGame();
        if (saved) {
            setPlayers(saved.players);
            setTopic(saved.topic);
            setTimer(saved.timer);
            setSpyCount(saved.spyCount);
            setGameData(saved.gameData);
            setGameState('PLAYING');
        }
    };

    const resetGame = () => {
        clearSavedGame();
        // Reset players to fresh list to fix duplication bug
        setPlayers(['Player 1', 'Player 2', 'Player 3']);
        setSpyCount(1);
        setGameMode('classic');
        setGameData({
            spies: [],
            doubleAgent: null,
            word: '',
            revealedCount: 0,
            roleMap: {}
        });
        setGameState('HOME');
    };

    // Wrapper for AI generation that injects history
    const handleGenerateWords = (t) => generateWordsFromTopic(t, wordHistory);

    return (
        <>
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    players, setPlayers,
                    topic, setTopic,
                    timer, setTimer,
                    spyCount, setSpyCount,
                    gameMode, setGameMode,
                    gameState, setGameState,
                    gameData, setGameData,
                    startGame, resetGame, continueGame,
                    hasSavedGame: hasSavedGame(),
                    TOPICS,
                    generateWordsFromTopic: handleGenerateWords,
                    sanitizeInput // Export for components to use
                })
            )}
        </>
    );
};

export { generateWordsFromTopic, hasSavedGame, sanitizeInput };
