'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function FAQ() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: t('group1.faq1_q'),
            a: t('group1.faq1_a')
        },
        {
            q: t('group1.faq2_q'),
            a: t('group1.faq2_a')
        },
        {
            q: t('group1.faq3_q'),
            a: t('group1.faq3_a')
        },
        {
            q: t('group1.faq4_q'),
            a: t('group1.faq4_a')
        },
        {
            q: t('group1.faq5_q'),
            a: t('group1.faq5_a')
        }
    ];

    return (
        <section id="faq" className="py-24 bg-[#050505]">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">{t('group1.faq_title')}</h2>
                    <p className="text-gray-400">{t('group1.faq_subtitle')}</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`border rounded-xl transition-all duration-300 ${openIndex === i ? 'border-primary/50 bg-[#0F1115]' : 'border-white/5 bg-[#09090b]'}`}>
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full text-left p-6 flex justify-between items-center"
                            >
                                <span className="text-lg font-bold text-white">{faq.q}</span>
                                {openIndex === i ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-gray-500" />}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
                                <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
