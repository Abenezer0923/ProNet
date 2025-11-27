import React from 'react';

export const HeroIllustration = () => {
    return (
        <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl rounded-2xl bg-white/50 backdrop-blur-sm border border-primary-100">
            {/* Background Elements */}
            <circle cx="400" cy="300" r="250" fill="url(#bg-gradient)" opacity="0.1" />
            <circle cx="600" cy="100" r="100" fill="#f59e0b" opacity="0.05" />
            <circle cx="100" cy="500" r="150" fill="#8a6534" opacity="0.05" />

            {/* Connection Lines */}
            <g stroke="#d4c0a0" strokeWidth="2" strokeOpacity="0.6">
                <line x1="200" y1="200" x2="400" y2="300" />
                <line x1="400" y1="300" x2="600" y2="200" />
                <line x1="400" y1="300" x2="400" y2="500" />
                <line x1="200" y1="200" x2="200" y2="400" />
                <line x1="600" y1="200" x2="600" y2="400" />
                <line x1="200" y1="400" x2="400" y2="500" />
                <line x1="600" y1="400" x2="400" y2="500" />
            </g>

            {/* Nodes (Avatars) */}
            {/* Central Node */}
            <g transform="translate(400, 300)">
                <circle r="40" fill="#e68a35" />
                <circle r="36" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M-15 10 Q0 25 15 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="-10" cy="-5" r="3" fill="white" />
                <circle cx="10" cy="-5" r="3" fill="white" />
            </g>

            {/* Surrounding Nodes */}
            <g transform="translate(200, 200)">
                <circle r="30" fill="#eda862" />
                <path d="M-10 8 Q0 18 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-7" cy="-3" r="2" fill="white" />
                <circle cx="7" cy="-3" r="2" fill="white" />
            </g>

            <g transform="translate(600, 200)">
                <circle r="30" fill="#ca6e24" />
                <path d="M-10 8 Q0 18 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-7" cy="-3" r="2" fill="white" />
                <circle cx="7" cy="-3" r="2" fill="white" />
            </g>

            <g transform="translate(200, 400)">
                <circle r="30" fill="#a8531d" />
                <path d="M-10 8 Q0 18 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-7" cy="-3" r="2" fill="white" />
                <circle cx="7" cy="-3" r="2" fill="white" />
            </g>

            <g transform="translate(600, 400)">
                <circle r="30" fill="#89421c" />
                <path d="M-10 8 Q0 18 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-7" cy="-3" r="2" fill="white" />
                <circle cx="7" cy="-3" r="2" fill="white" />
            </g>

            <g transform="translate(400, 500)">
                <circle r="30" fill="#f59e0b" />
                <path d="M-10 8 Q0 18 10 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="-7" cy="-3" r="2" fill="white" />
                <circle cx="7" cy="-3" r="2" fill="white" />
            </g>

            {/* Floating Elements */}
            <circle cx="300" cy="150" r="10" fill="#f4ca99" opacity="0.6">
                <animate attributeName="cy" values="150;140;150" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="450" r="8" fill="#eda862" opacity="0.6">
                <animate attributeName="cy" values="450;460;450" dur="4s" repeatCount="indefinite" />
            </circle>

            {/* Definitions */}
            <defs>
                <linearGradient id="bg-gradient" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fdf3e6" />
                    <stop offset="100%" stopColor="#f4ca99" />
                </linearGradient>
            </defs>
        </svg>
    );
};
