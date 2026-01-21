// Card Data Definitions with Rarity Tiers
// Rarity: Common (50), Rare (100), Epic (200), Legendary (400), Mythic (800)

export const RARITY = {
    COMMON: { name: 'Common', price: 50, color: '#9ca3af' },
    RARE: { name: 'Rare', price: 100, color: '#3b82f6' },
    EPIC: { name: 'Epic', price: 200, color: '#a855f7' },
    LEGENDARY: { name: 'Legendary', price: 400, color: '#f59e0b' },
    MYTHIC: { name: 'Mythic', price: 800, color: '#ef4444' },
    EXCLUSIVE: { name: 'Exclusive', price: 9999, color: '#ffffff', gradient: 'linear-gradient(135deg, #000000 0%, #ffffff 100%)' }
};

export const AGENT_CARDS = [
    { id: 'agent_01', name: 'The Rookie', description: 'Fresh out of the academy, still smells like training manuals.', image: '/agent-card.png', rarity: 'COMMON' },
    { id: 'agent_02', name: 'The Veteran', description: 'Has seen things. Many things. Mostly paperwork.', image: '/assets/cards/agent_02.png', rarity: 'COMMON' },
    { id: 'agent_03', name: 'The Tech Wiz', description: 'Can hack anything except social situations.', image: '/assets/cards/agent_03.png', rarity: 'RARE' },
    { id: 'agent_04', name: 'The Smooth Talker', description: 'Could sell ice to a penguin. And has.', image: '/assets/cards/agent_04.png', rarity: 'RARE' },
    { id: 'agent_05', name: 'The Ghost', description: 'You didn\'t see them. They were never here.', image: '/assets/cards/agent_05.png', rarity: 'EPIC' },
    { id: 'agent_06', name: 'The Analyst', description: 'Finds patterns in everything. EVERYTHING.', image: '/assets/cards/agent_06.png', rarity: 'EPIC' },
    { id: 'agent_07', name: 'The Field Agent', description: 'Prefers action over meetings. Hates meetings.', image: '/assets/cards/agent_07.png', rarity: 'LEGENDARY' },
    { id: 'agent_08', name: 'The Handler', description: 'Knows everyone\'s secrets. Tells no one. Usually.', image: '/assets/cards/agent_08.png', rarity: 'LEGENDARY' },
    { id: 'agent_09', name: 'The Legend', description: 'Retired five times. Keeps coming back.', image: '/assets/cards/agent_09.png', rarity: 'MYTHIC' },
    { id: 'agent_10', name: 'The Director', description: 'Signs the paychecks. Fear the paperwork.', image: '/assets/cards/agent_10.png', rarity: 'MYTHIC' },
];

export const SPY_CARDS = [
    { id: 'spy_01', name: 'The Infiltrator', description: 'Blends in like a chameleon. A suspiciously quiet chameleon.', image: '/spy-card.png', rarity: 'COMMON' },
    { id: 'spy_02', name: 'The Saboteur', description: 'If it\'s broken, they probably did it.', image: '/assets/cards/spy_02.png', rarity: 'COMMON' },
    { id: 'spy_03', name: 'The Deceiver', description: 'Lies so well they sometimes fool themselves.', image: '/assets/cards/spy_03.png', rarity: 'RARE' },
    { id: 'spy_04', name: 'The Shadow', description: 'Always watching. Always lurking. Always creepy.', image: '/assets/cards/spy_04.png', rarity: 'RARE' },
    { id: 'spy_05', name: 'The Mastermind', description: 'Has a plan. And a backup plan. And a backup backup plan.', image: '/assets/cards/spy_05.png', rarity: 'EPIC' },
    { id: 'spy_06', name: 'The Manipulator', description: 'Turns friends into enemies, then back again.', image: '/assets/cards/spy_06.png', rarity: 'EPIC' },
    { id: 'spy_07', name: 'The Assassin', description: 'Quiet. Efficient. Terrible at parties.', image: '/assets/cards/spy_07.png', rarity: 'LEGENDARY' },
    { id: 'spy_08', name: 'The Viper', description: 'A smile that hides a thousand poisons.', image: '/assets/cards/spy_08.png', rarity: 'LEGENDARY' },
    { id: 'spy_09', name: 'The Phantom', description: 'Leaves no trace. Except dramatic entrances.', image: '/assets/cards/spy_09.png', rarity: 'MYTHIC' },
    { id: 'spy_10', name: 'The Nightmare', description: 'Agents wake up screaming this name.', image: '/assets/cards/spy_10.png', rarity: 'MYTHIC' },
];

export const DOUBLE_AGENT_CARDS = [
    { id: 'da_default', name: 'The Traitor', description: 'Playing both sides is a dangerous game.', image: '/double-agent-card.png', rarity: 'COMMON' },
    { id: 'da_01', name: 'The Turncoat', description: 'Loyalty is just a word. A very flexible word.', image: '/assets/cards/double_agent_01.png', rarity: 'EPIC' },
    { id: 'da_02', name: 'The Wildcard', description: 'Even they don\'t know whose side they\'re on today.', image: '/assets/cards/double_agent_02.png', rarity: 'LEGENDARY' },
    { id: 'da_03', name: 'The Puppeteer', description: 'Pulls strings from both sides. Has many strings.', image: '/assets/cards/double_agent_03.png', rarity: 'MYTHIC' },
];

export const SPECIAL_CARDS = {
    healer: {
        id: 'healer',
        name: 'The Medic',
        description: 'Can bring one innocent back from ejection. No refunds.',
        image: '/assets/cards/healer.png',
        rarity: 'LEGENDARY',
        ability: 'Revive one ejected innocent per game'
    }
};

// Friend redemption codes - one-time use custom cards
export const FRIEND_CODES = {
    'BEVIN2026': {
        type: 'spy',
        cardId: 'bevin_spy',
        name: "Bevin's Shadow",
        description: 'The quietest spy in the game. You\'ll never see him coming.',
        image: '/assets/cards/bevin_spy.png',
        rarity: 'EXCLUSIVE'
    },
    'AMRO2026': {
        type: 'agent',
        cardId: 'amro_agent',
        name: "Amro's Badge",
        description: 'Justice never sleeps. Neither does Amro.',
        image: '/assets/cards/amro_agent.png',
        rarity: 'EXCLUSIVE'
    },
    'SHAYANBUNZ': {
        type: 'spy',
        cardId: 'shayan_spy',
        name: "Shayan's Disguise",
        description: 'Master of disguise. Also master of bunz.',
        image: '/assets/cards/shayan_spy.png',
        rarity: 'EXCLUSIVE'
    }
};

// Get card price based on rarity
export const getCardPrice = (card) => {
    return RARITY[card.rarity]?.price || 100;
};

// Get rarity info
export const getRarityInfo = (rarityKey) => {
    return RARITY[rarityKey] || RARITY.COMMON;
};

// Helper to get all cards of a type
export const getAllCards = (type) => {
    switch (type) {
        case 'agent': return AGENT_CARDS;
        case 'spy': return SPY_CARDS;
        case 'doubleAgent': return DOUBLE_AGENT_CARDS;
        default: return [];
    }
};
