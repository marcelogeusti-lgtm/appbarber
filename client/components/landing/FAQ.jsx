'use client';
import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { trackEvent } from '../../lib/analytics';

export default function FAQ() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { q: t('group1.faq1_q'), a: t('group1.faq1_a') },
        { q: t('group1.faq2_q'), a: t('group1.faq2_a') },
        { q: t('group1.faq3_q'), a: t('group1.faq3_a') },
        { q: t('group1.faq4_q'), a: t('group1.faq4_a') },
        { q: t('group1.faq5_q'), a: t('group1.faq5_a') },
    ];

    return (
        <section id="faq" className="bg-[#050505] py-24 px-5 sm:px-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">

                    {/* ── LEFT — sticky header ── */}
                    <div className="lg:w-[340px] lg:shrink-0">
                        <div className="lg:sticky lg:top-28">

                            {/* Eyebrow */}
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary mb-5 font-body">
                                {t('group1.faq_label')}
                            </p>

                            {/* Big headline */}
                            <h2 className="font-display text-[36px] sm:text-[44px] font-light tracking-tight text-white leading-[1.1] mb-6">
                                {t('group1.faq_headline')}
                            </h2>

                            {/* Subtitle */}
                            <p className="font-body text-[14px] leading-relaxed text-white/45 mb-8">
                                {t('group1.faq_desc')}
                            </p>

                            {/* Support CTA */}
                            <a
                                href="https://wa.me/5521991164174"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEvent('whatsapp_click', { location: 'faq' })}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[13px] font-medium text-white/60 transition-all duration-200 hover:border-white/20 hover:text-white hover:bg-white/[0.06] font-body"
                            >
                                <MessageCircle className="w-4 h-4 text-primary" />
                                {t('group1.faq_contact')}
                            </a>
                        </div>
                    </div>

                    {/* ── RIGHT — accordion ── */}
                    <div className="flex-1 divide-y divide-white/[0.06]">
                        {faqs.map((faq, i) => (
                            <div key={i}>
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                                >
                                    <span className="font-body text-[15px] font-medium text-white/80 group-hover:text-white transition-colors duration-200 leading-snug">
                                        {faq.q}
                                    </span>
                                    <span className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${
                                        openIndex === i
                                            ? 'border-primary/40 bg-primary/10 text-primary rotate-180'
                                            : 'border-white/10 bg-white/[0.03] text-white/40 group-hover:border-white/20 group-hover:text-white/70'
                                    }`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    openIndex === i ? 'max-h-96 pb-5' : 'max-h-0'
                                }`}>
                                    <p className="font-body text-[14px] leading-relaxed text-white/45 pr-14">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
