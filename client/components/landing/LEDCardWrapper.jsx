'use client';

export default function LEDCardWrapper({ children, className = '' }) {
    return (
        <div className={`relative group ${className}`}>
            {children}
        </div>
    );
}
