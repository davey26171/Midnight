import React from 'react';
import { Trophy, Clock, Brain, PartyPopper, Sparkles } from 'lucide-react';

/**
 * Game Icons Configuration
 * Icons are in /public/
 */

// Custom image icon paths - matching your files
export const ICONS = {
    // Character icons
    spy: '/spy.png',
    agent: '/agent.png',

    // Game items
    magnifier: '/magnifier.png',
    location: '/location.png',
    key: '/key.png',
    briefcase: '/briefcase.png',

    // Card states
    cardBack: '/card-back.png',
    unknown: '/card-back.png', // Using card-back for unknown too

    // Role cards (for role reveal)
    spyCard: '/spy-card.png',
    agentCard: '/agent-card.png',
};

// Lucide icons for UI elements
const LUCIDE_ICONS = {
    trophy: Trophy,
    timer: Clock,
    brain: Brain,
    celebrate: PartyPopper,
    sparkle: Sparkles,
};

// Icon component for consistent rendering
export function GameIcon({ name, size = 32, style = {}, className = '', color }) {
    // Check if it's a Lucide icon first
    const LucideIcon = LUCIDE_ICONS[name];
    if (LucideIcon) {
        return (
            <LucideIcon
                size={size}
                className={className}
                color={color}
                style={style}
            />
        );
    }

    // Otherwise use custom image
    const src = ICONS[name];

    if (!src) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return (
        <img
            src={src}
            alt={name}
            className={className}
            style={{
                width: size,
                height: size,
                objectFit: 'cover',
                ...style
            }}
        />
    );
}

// Memory card icon names
export const MEMORY_CARD_ICONS = ['spy', 'agent', 'magnifier', 'location', 'key', 'briefcase'];
