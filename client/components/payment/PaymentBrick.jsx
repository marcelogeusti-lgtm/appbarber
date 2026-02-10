'use client';

import React, { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const PaymentBrick = ({
    amount,
    barbershopId,
    preferenceId,
    description,
    payer,
    onSuccess,
    onError,
    installments = 12
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [publicKey, setPublicKey] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPublicKey = async () => {
            try {
                const { data } = await axios.get(`/api/payments/public-key?barbershopId=${barbershopId}`);
                if (data.publicKey) {
                    initMercadoPago(data.publicKey, { locale: 'pt-BR' });
                    setPublicKey(data.publicKey);
                } else {
                    throw new Error('Chave pública não encontrada.');
                }
            } catch (err) {
                console.error("Failed to init MP:", err);
                if (onError) onError(err);
                setIsLoading(false);
            }
        };

        if (barbershopId) {
            fetchPublicKey();
        } else {
            // Fallback or error if no barbershopId
            setIsLoading(false);
        }
    }, [barbershopId]);

    const initialization = {
        amount: Number(amount),
        preferenceId: preferenceId,
        payer: payer ? {
            email: payer.email,
            firstName: payer.name?.split(' ')[0],
            lastName: payer.name?.split(' ').slice(1).join(' '),
        } : undefined
    };

    const customization = {
        paymentMethods: {
            ticket: 'all',
            bankTransfer: 'all',
            creditCard: 'all',
            debitCard: 'all',
            mercadoPago: 'all',
            maxInstallments: installments
        },
        visual: {
            style: {
                theme: 'default',
            },
            hidePaymentButton: false
        }
    };

    const handleSubmit = async (param) => {
        // Brick onSubmit returns { formData }
        const { formData } = param;
        try {
            const response = await axios.post('/api/payments/process-brick', {
                ...formData,
                barbershopId,
                description,
                transaction_amount: Number(amount),
                payer: {
                    email: formData.payer.email,
                    ...formData.payer
                } // Ensure payer info is passed explicitly if needed by backend
            });

            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            console.error('Payment Brick Error:', error);
            if (onError) {
                onError(error.response?.data?.error || error.message);
            }
        }
    };

    if (isLoading && !publicKey) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!publicKey) {
        return <div className="text-red-500 text-center p-4 bg-red-50 rounded">Erro: Sistema de pagamento indisponível no momento.</div>;
    }

    return (
        <div className="payment-brick-container w-full max-w-md mx-auto bg-white p-4 rounded-lg shadow-sm border">
            <Payment
                initialization={initialization}
                customization={customization}
                onSubmit={handleSubmit}
                onReady={() => setIsLoading(false)}
                onError={(error) => {
                    console.error('MP Brick Error:', error);
                    if (onError) onError(error);
                }}
            />
        </div>
    );
};

export default PaymentBrick;
