'use client';
import { useState, useEffect } from 'react';

const NOTIFICACOES = [
    "Lucas agendou Corte Degradê",
    "Mateus agendou Corte + Barba",
    "Pedro agendou Corte Social",
    "João agendou Barba",
    "Rafael agendou Corte Navalhado"
];

export default function LiveActivity() {
    const [status, setStatus] = useState('hidden'); // hidden, entering, visible, exiting
    const [currentIdx, setCurrentIdx] = useState(0);
    const [minutos, setMinutos] = useState(2);

    useEffect(() => {
        let timeout;

        const runCycle = () => {
            // Pick next notification
            setCurrentIdx(prev => (prev + 1) % NOTIFICACOES.length);
            setMinutos(Math.floor(Math.random() * 5) + 1);

            // 1. Entry Phase
            setStatus('entering');

            timeout = setTimeout(() => {
                setStatus('visible');

                // 2. Visible Phase (Wait 6 seconds)
                timeout = setTimeout(() => {
                    setStatus('exiting');

                    // 3. Exit Phase (0.3s)
                    timeout = setTimeout(() => {
                        setStatus('hidden');

                        // 4. Wait before next cycle (2 seconds)
                        timeout = setTimeout(runCycle, 2000);

                    }, 300);
                }, 6000);
            }, 500);
        };

        // Initial delay
        timeout = setTimeout(runCycle, 1000);

        return () => clearTimeout(timeout);
    }, []);

    const getStyles = () => {
        const base = {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'white',
            padding: '8px 12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 5px 18px rgba(0,0,0,0.15)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '260px',
            transition: 'all 0.5s ease-out',
        };

        if (status === 'hidden' || status === 'entering') {
            return {
                ...base,
                transform: 'translateX(-120%)',
                opacity: 0,
                transition: status === 'hidden' ? 'none' : base.transition
            };
        }

        if (status === 'visible') {
            return {
                ...base,
                transform: 'translateX(0)',
                opacity: 1,
            };
        }

        if (status === 'exiting') {
            return {
                ...base,
                transform: 'translateY(10px)',
                opacity: 0,
                transition: 'all 0.3s ease-in'
            };
        }

        return base;
    };

    return (
        <div style={getStyles()}>
            <img
                src="/logos/logo_icon.png"
                alt="Logo"
                style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%'
                }}
            />

            <div style={{ lineHeight: '1.4' }}>
                <strong style={{ display: 'block' }}>Novo agendamento</strong>
                {NOTIFICACOES[currentIdx]}<br />
                <span style={{ color: 'gray', fontSize: '11px' }}>há {minutos} minutos</span>
            </div>
        </div>
    );
}
