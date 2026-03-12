import { useState, useMemo } from 'react';

export function useBooking() {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [pendingFees, setPendingFees] = useState([]);

    // Reset flow properly
    const resetBooking = () => {
        setStep(1);
        setSelectedService(null);
        setSelectedProfessional(null);
        setSelectedDate('');
        setSelectedTime('');
        setSelectedProducts([]);
        setPendingFees([]);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const selectService = (service) => {
        setSelectedService(service);
        setStep(1); // Ensure we start fresh if re-selecting
    };

    const selectProfessional = (pro) => {
        setSelectedProfessional(pro);
        setStep(2); // Move to Date selection (usually step 3, but let's align with page logic)
    };

    // Toggle product selection
    const toggleProduct = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const totalValue = useMemo(() => {
        const servicePrice = Number(selectedService?.price || 0);
        const productsPrice = selectedProducts?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;
        const feesTotal = pendingFees?.reduce((sum, f) => sum + Number(f.feeValue || 0), 0) || 0;
        return servicePrice + productsPrice + feesTotal;
    }, [selectedService, selectedProducts, pendingFees]);

    return {
        step, setStep,
        selectedService, selectService,
        selectedProfessional, selectProfessional,
        selectedDate, setSelectedDate,
        selectedTime, setSelectedTime,
        selectedProducts, toggleProduct,
        pendingFees, setPendingFees,
        totalValue,
        resetBooking,
        nextStep, prevStep
    };
}
