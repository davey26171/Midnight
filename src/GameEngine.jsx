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
const generateWordsFromTopic = async (topicInput) => {
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
                    content: `Generate exactly 8 short, specific items related to "${sanitizedTopic}". These will be used in a spy game where players need to guess a secret word. Make them specific and recognizable. Return ONLY the items as a comma-separated list, nothing else.`
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
    const [gameState, setGameState] = useState('HOME'); // HOME, LOBBY, REVEAL, PLAYING, RESULTS
    const [players, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3']);
    const [topic, setTopic] = useState('Places');
    const [customWord, setCustomWord] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [spyCount, setSpyCount] = useState(1);
    const [gameData, setGameData] = useState({
        spies: [],
        word: '',
        revealedCount: 0
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

        const activeWords = customTopicWords.length > 0 ? customTopicWords : TOPICS[topic];
        if (activeWords.length === 0) return;

        const randomWord = activeWords[Math.floor(Math.random() * activeWords.length)];

        // Select multiple spies
        let currentSpies = [];
        let availableIndices = Array.from({ length: players.length }, (_, i) => i);

        for (let i = 0; i < spyCount; i++) {
            if (availableIndices.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableIndices.length);
            const spyIndex = availableIndices[randomIndex];
            currentSpies.push(players[spyIndex]);
            availableIndices.splice(randomIndex, 1);
        }

        setGameData({
            spies: currentSpies,
            word: randomWord,
            revealedCount: 0
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
        setGameState('HOME');
    };

    return (
        <>
            {React.Children.map(children, child =>
                React.cloneElement(child, {
                    players, setPlayers,
                    topic, setTopic,
                    timer, setTimer,
                    spyCount, setSpyCount,
                    gameState, setGameState,
                    gameData, setGameData,
                    startGame, resetGame, continueGame,
                    hasSavedGame: hasSavedGame(),
                    TOPICS,
                    generateWordsFromTopic,
                    sanitizeInput // Export for components to use
                })
            )}
        </>
    );
};

export { generateWordsFromTopic, hasSavedGame, sanitizeInput };
