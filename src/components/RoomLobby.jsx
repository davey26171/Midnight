import React, { useState, useEffect } from 'react';
import { Users, Copy, ArrowLeft, Play, Check, Wifi, WifiOff, Settings } from 'lucide-react';
import { createRoom, joinRoom, leaveRoom, subscribeToRoom, updateRoomSettings, startRoomGame, generateRoomCode } from '../firebase';

export default function RoomLobby({ playerName, onStartGame, onBack }) {
    const [mode, setMode] = useState('menu'); // menu, create, join, waiting
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [userName, setUserName] = useState(playerName || 'Player');
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [gameMode, setGameMode] = useState('classic');
    const [connected, setConnected] = useState(true);
    const [spyCount, setSpyCount] = useState(1);
    const [chaosMode, setChaosMode] = useState(false);

    const [hasStarted, setHasStarted] = useState(false);

    // Subscribe to room updates
    useEffect(() => {
        if (!roomCode) return;

        const unsubscribe = subscribeToRoom(roomCode, (data) => {
            if (!data) {
                // Room was deleted
                setError('Room closed by host');
                setMode('menu');
                setRoomCode('');
                return;
            }

            setPlayers(data.players || []);
            setGameMode(data.gameMode || 'classic');

            if (data.gameState === 'REVEAL' && data.gameData && !hasStarted) {
                // Game started!
                setHasStarted(true);
                onStartGame({
                    players: data.players,
                    gameData: data.gameData,
                    roomCode,
                    playerName: userName,
                    isMultiplayer: true
                });
            }
        });

        return unsubscribe;
    }, [roomCode, onStartGame, hasStarted]);

    const handleCreateRoom = async () => {
        try {
            setError('');
            const code = await createRoom(userName.trim());
            setRoomCode(code);
            setIsHost(true);
            setMode('waiting');
        } catch (e) {
            setError(e.message || 'Failed to create room');
        }
    };

    const handleJoinRoom = async () => {
        if (!userName.trim()) {
            setError('Enter your name');
            return;
        }
        if (!inputCode.trim()) {
            setError('Enter room code');
            return;
        }

        try {
            setError('');
            await joinRoom(inputCode.toUpperCase(), userName.trim());
            setRoomCode(inputCode.toUpperCase());
            setIsHost(false);
            setMode('waiting');
        } catch (e) {
            setError(e.message || 'Failed to join room');
        }
    };

    const handleLeaveRoom = async () => {
        if (roomCode) {
            await leaveRoom(roomCode, userName);
        }
        setRoomCode('');
        setMode('menu');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStartGame = async () => {
        console.log('Start Game clicked, players:', players.length);

        if (players.length < 3) {
            setError('Need at least 3 players');
            return;
        }

        try {
            // Filter out any empty player names (Firebase keys can't be empty)
            const validPlayers = players.filter(p => p && p.trim());

            if (validPlayers.length < 2) {
                setError('Need at least 2 valid players');
                return;
            }

            // Generate roles based on game mode
            const roleMap = {};
            const shuffled = [...validPlayers].sort(() => 0.5 - Math.random());

            let spies = [];
            let healer = null;
            let doubleAgent = null;
            let roleIndex = 0;

            if (chaosMode && validPlayers.length >= 6) {
                // Chaos Mode: Healer + Double Agent + Spies + Agents
                healer = shuffled[roleIndex++];
                doubleAgent = shuffled[roleIndex++];
                spies = shuffled.slice(roleIndex, roleIndex + spyCount);
                roleIndex += spyCount;

                validPlayers.forEach(p => {
                    if (p === healer) {
                        roleMap[p] = 'healer';
                    } else if (p === doubleAgent) {
                        roleMap[p] = 'doubleAgent';
                    } else if (spies.includes(p)) {
                        roleMap[p] = 'spy';
                    } else {
                        roleMap[p] = 'agent';
                    }
                });
            } else {
                // Classic Mode: Just Spies and Agents
                spies = shuffled.slice(0, spyCount);
                validPlayers.forEach(p => {
                    roleMap[p] = spies.includes(p) ? 'spy' : 'agent';
                });
            }

            const words = ['Hospital', 'Space Station', 'Submarine', 'University', 'Movie Studio'];
            const word = words[Math.floor(Math.random() * words.length)];

            const gameData = {
                spies,
                healer,
                doubleAgent,
                word,
                revealedCount: 0,
                roleMap,
                chaosMode,
                healerUsed: false // Track if healer has used their ability
            };

            console.log('Starting room game with data:', gameData);
            await startRoomGame(roomCode, gameData);
            console.log('Game started successfully');
        } catch (e) {
            console.error('Error starting game:', e);
            setError(e.message || 'Failed to start game');
        }
    };

    // Menu screen
    if (mode === 'menu') {
        return (
            <div className="screen-container">
                <button onClick={onBack} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '8px 12px' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <Users size={48} color="var(--accent)" style={{ marginBottom: 12 }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Multiplayer</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Play with friends online</p>
                    </div>

                    {/* Username Input */}
                    <div style={{ width: '100%', maxWidth: 280 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Your Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name"
                            maxLength={20}
                            style={{
                                padding: '12px 16px',
                                fontSize: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid var(--border)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleCreateRoom}
                        className="btn-primary"
                        style={{ width: '100%', maxWidth: 280 }}
                        disabled={!userName.trim()}
                    >
                        Create Room
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className="btn-secondary"
                        style={{ width: '100%', maxWidth: 280 }}
                        disabled={!userName.trim()}
                    >
                        Join Room
                    </button>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}
                </div>
            </div>
        );
    }

    // Join screen
    if (mode === 'join') {
        return (
            <div className="screen-container">
                <button onClick={() => setMode('menu')} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '8px 12px' }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Join a Room</h2>

                    <div style={{ width: '100%', maxWidth: 280 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Your Name</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your name"
                            maxLength={20}
                            style={{
                                padding: '12px 16px',
                                fontSize: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid var(--border)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ width: '100%', maxWidth: 280 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Room Code</label>
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="ABCD12"
                            maxLength={6}
                            style={{
                                padding: '16px 24px',
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                letterSpacing: '0.3em',
                                background: 'rgba(0,0,0,0.3)',
                                border: '2px solid var(--border)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                width: '100%',
                                textTransform: 'uppercase'
                            }}
                        />
                    </div>

                    <button onClick={handleJoinRoom} className="btn-primary" style={{ width: '100%', maxWidth: 280 }}>
                        Join Game
                    </button>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}
                </div>
            </div>
        );
    }

    // Waiting room
    return (
        <div className="screen-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <button onClick={handleLeaveRoom} className="btn-secondary" style={{ padding: '8px 12px' }}>
                    <ArrowLeft size={16} /> Leave
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {connected ? <Wifi size={14} color="var(--success)" /> : <WifiOff size={14} color="var(--error)" />}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {connected ? 'Connected' : 'Reconnecting...'}
                    </span>
                </div>
            </div>

            {/* Room Code */}
            <div className="glass-card" style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>Room Code</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        color: 'var(--accent-light)'
                    }}>
                        {roomCode}
                    </span>
                    <button
                        onClick={handleCopyCode}
                        style={{
                            background: copied ? 'var(--success)' : 'var(--accent)',
                            border: 'none',
                            padding: 8,
                            borderRadius: 8,
                            cursor: 'pointer'
                        }}
                    >
                        {copied ? <Check size={16} color="white" /> : <Copy size={16} color="white" />}
                    </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>
                    Share this code with friends
                </p>
            </div>

            {/* Players List */}
            <div className="glass-card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Users size={18} color="var(--accent)" />
                    <span style={{ fontWeight: 600 }}>Players ({players.length}/16)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {players.map((player, i) => (
                        <div key={i} style={{
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 8,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <span style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: i === 0 ? 'var(--accent)' : 'var(--success)'
                            }} />
                            {player} {i === 0 && '(Host)'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Spy Settings (Host Only) */}
            {isHost && (
                <div className="glass-card" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: 600 }}>Number of Spies</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max {Math.floor(players.length / 2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            onClick={() => setSpyCount(Math.max(1, spyCount - 1))}
                            className="btn-secondary"
                            style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            disabled={spyCount <= 1}
                        >
                            -
                        </button>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{spyCount}</span>
                        <button
                            onClick={() => setSpyCount(Math.min(Math.floor(players.length / 2) || 1, spyCount + 1))}
                            className="btn-secondary"
                            style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            disabled={spyCount >= (Math.floor(players.length / 2) || 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* Chaos Mode Toggle (Host Only) */}
            {isHost && (
                <div className="glass-card" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: 600, color: chaosMode ? 'var(--accent)' : 'var(--text-primary)' }}>
                            🌀 Chaos Mode
                        </span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200 }}>
                            Adds Healer + Double Agent roles (6+ players)
                        </p>
                    </div>
                    <button
                        onClick={() => setChaosMode(!chaosMode)}
                        disabled={players.length < 6}
                        style={{
                            width: 56,
                            height: 32,
                            borderRadius: 16,
                            background: chaosMode ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            cursor: players.length >= 6 ? 'pointer' : 'not-allowed',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            opacity: players.length < 6 ? 0.5 : 1
                        }}
                    >
                        <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: 4,
                            left: chaosMode ? 28 : 4,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                    </button>
                </div>
            )}

            {/* Start Button (Host Only) */}
            {isHost && (
                <button
                    onClick={handleStartGame}
                    className="btn-primary animate-glow"
                    style={{ marginTop: 'auto', marginBottom: 20 }}
                    disabled={players.length < 3}
                >
                    <Play size={18} />
                    Start Game ({players.length} players)
                </button>
            )}

            {!isHost && (
                <p style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', marginBottom: 20 }}>
                    Waiting for host to start...
                </p>
            )}

            {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}
        </div>
    );
}
