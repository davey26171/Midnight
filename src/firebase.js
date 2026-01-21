// Firebase configuration for Midnight game multiplayer
// User needs to replace these values with their own Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, onValue, update, remove, off } from 'firebase/database';

// Firebase configuration - REPLACE WITH YOUR OWN VALUES
// Get these from: https://console.firebase.google.com
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Generate a random 6-character room code
export const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// Create a new room
export const createRoom = async (hostName) => {
    const roomCode = generateRoomCode();
    const roomRef = ref(database, `rooms/${roomCode}`);

    await set(roomRef, {
        host: hostName,
        players: [hostName],
        gameState: 'LOBBY',
        gameMode: 'classic',
        topic: 'Places',
        timer: 300,
        createdAt: Date.now(),
        gameData: null
    });

    return roomCode;
};

// Join an existing room
export const joinRoom = async (roomCode, playerName) => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error('Room not found');
    }

    const roomData = snapshot.val();
    if (roomData.gameState !== 'LOBBY') {
        throw new Error('Game already in progress');
    }

    if (roomData.players.length >= 16) {
        throw new Error('Room is full');
    }

    if (roomData.players.includes(playerName)) {
        throw new Error('Name already taken');
    }

    const updatedPlayers = [...roomData.players, playerName];
    await update(roomRef, { players: updatedPlayers });

    return roomData;
};

// Leave a room
export const leaveRoom = async (roomCode, playerName) => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) return;

    const roomData = snapshot.val();
    const updatedPlayers = roomData.players.filter(p => p !== playerName);

    if (updatedPlayers.length === 0 || playerName === roomData.host) {
        // Delete room if empty or host leaves
        await remove(roomRef);
    } else {
        await update(roomRef, { players: updatedPlayers });
    }
};

// Update room settings
export const updateRoomSettings = async (roomCode, settings) => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await update(roomRef, settings);
};

// Start game in room
export const startRoomGame = async (roomCode, gameData) => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await update(roomRef, {
        gameState: 'REVEAL',
        gameData
    });
};

// Listen to room changes
export const subscribeToRoom = (roomCode, callback) => {
    console.log(`[FIREBASE] Setting up listener for rooms/${roomCode}`);
    const roomRef = ref(database, `rooms/${roomCode}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
        console.log(`[FIREBASE] onValue fired for ${roomCode}`, snapshot.exists());
        callback(snapshot.val());
    }, (error) => {
        console.error(`[FIREBASE] Listener error:`, error);
    });

    return () => {
        console.log(`[FIREBASE] Removing listener for ${roomCode}`);
        unsubscribe();
    };
};

// Send chat message
export const sendMessage = async (roomCode, playerName, message) => {
    const messagesRef = ref(database, `rooms/${roomCode}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
        player: playerName,
        text: message,
        timestamp: Date.now()
    });
};

// Mark player as ready (seen their card)
export const markPlayerReady = async (roomCode, playerName) => {
    const readyRef = ref(database, `rooms/${roomCode}/playersReady/${playerName}`);
    await set(readyRef, true);
};

// Submit vote
export const submitVote = async (roomCode, voterName, votedPlayer) => {
    const voteRef = ref(database, `rooms/${roomCode}/votes/${voterName}`);
    await set(voteRef, votedPlayer);
};

// Update game phase (REVEAL -> PLAYING -> VOTING -> RESULTS)
export const updateGamePhase = async (roomCode, phase) => {
    console.log(`Updating request: Change room ${roomCode} phase to ${phase}`);
    const stateRef = ref(database, `rooms/${roomCode}/gameState`);
    await set(stateRef, phase);
    console.log(`Update complete: Room ${roomCode} phase is now ${phase}`);
};

// Set game winner
export const setWinner = async (roomCode, winner) => {
    const winnerRef = ref(database, `rooms/${roomCode}/winner`);
    await set(winnerRef, winner);
};

// Reset room for new game (keep players)
export const resetRoom = async (roomCode) => {
    updates[`rooms/${roomCode}/gameState`] = 'LOBBY';
    updates[`rooms/${roomCode}/gameData`] = null;
    updates[`rooms/${roomCode}/votes`] = null;
    updates[`rooms/${roomCode}/playersReady`] = null;
    updates[`rooms/${roomCode}/winner`] = null;
    updates[`rooms/${roomCode}/messages`] = null;
    updates[`rooms/${roomCode}/ejected`] = null;
    updates[`rooms/${roomCode}/lastEjected`] = null;

    await update(ref(database), updates);
};

export const ejectPlayer = async (roomCode, player) => {
    const updates = {};
    updates[`rooms/${roomCode}/ejected/${player}`] = true;
    updates[`rooms/${roomCode}/lastEjected`] = player;
    await update(ref(database), updates);
};

export const clearVotes = async (roomCode) => {
    await set(ref(database, `rooms/${roomCode}/votes`), null);
};

// ============================================
// PLAYER PROGRESSION (Cloud Save)
// ============================================

const PLAYER_ID_KEY = 'midnight_player_id';

// Get a readable device/platform name
const getDeviceName = () => {
    // Use navigator.platform first (more reliable)
    const platform = navigator.platform?.toLowerCase() || '';
    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'Mac';
    if (platform.includes('linux')) return 'Linux';

    // Fall back to userAgent for mobile
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';

    return 'Device';
};

// Generate or retrieve unique device ID with readable name
export const getOrCreatePlayerId = () => {
    let playerId = localStorage.getItem(PLAYER_ID_KEY);
    if (!playerId) {
        // Generate a readable ID: DeviceName_ShortCode
        const device = getDeviceName();
        const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        playerId = `${device}_${shortCode}`;
        localStorage.setItem(PLAYER_ID_KEY, playerId);
    }
    return playerId;
};

// Load player progression from Firebase
export const loadPlayerProgression = async (playerId) => {
    const playerRef = ref(database, `players/${playerId}`);
    const snapshot = await get(playerRef);
    return snapshot.exists() ? snapshot.val() : null;
};

// Save player progression to Firebase
export const savePlayerProgression = async (playerId, data) => {
    const playerRef = ref(database, `players/${playerId}`);
    await set(playerRef, {
        ...data,
        lastUpdated: Date.now()
    });
};

// Subscribe to player progression changes (for real-time admin edits)
export const subscribeToPlayerProgression = (playerId, callback) => {
    const playerRef = ref(database, `players/${playerId}`);
    const unsubscribe = onValue(playerRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
    return unsubscribe;
};

// Update specific player field (useful for admin console)
export const updatePlayerBits = async (playerId, bits) => {
    const playerRef = ref(database, `players/${playerId}`);
    await update(playerRef, { bits, lastUpdated: Date.now() });
};

export { database, ref, update, get };
