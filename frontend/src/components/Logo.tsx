import React from 'react';

export const Logo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
    const sizes = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12"
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`${sizes[size]} bg-primary-900 rounded-lg flex items-center justify-center transform rotate-3`}>
                <div className="w-full h-full border-2 border-primary-300 rounded-lg transform -rotate-6 flex items-center justify-center bg-primary-900">
                    <span className={`font-bold text-white ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
                        P
                    </span>
                </div>
            </div>
            <span className={`font-bold text-primary-900 tracking-tight ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
                ProNet
            </span>
        </div>
    );
};
