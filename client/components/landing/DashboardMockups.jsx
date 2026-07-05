'use client';
import { useTranslation } from '../../contexts/LanguageContext';
import {
    LayoutGrid, BarChart3, Calendar, UserCheck, Scissors, ShoppingBag,
    Users, ScrollText, Package, Gift, Star, Search, Wallet, TrendingUp,
    Trophy, Clock, Crown, LogOut, Printer, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';

/* Mockups HTML dos painéis (substituem os prints .png para que o texto traduza).
   Escala interna fixa; o container pai controla o tamanho final. */

function Sidebar({ t, active }) {
    const nav = t('mockups.nav');
    const items = [
        { key: 'overview', icon: LayoutGrid },
        { key: 'analytics', icon: BarChart3 },
        { key: 'schedule', icon: Calendar },
        { section: 'records' },
        { key: 'professionals', icon: UserCheck },
        { key: 'services', icon: Scissors },
        { key: 'products', icon: ShoppingBag },
        { key: 'clients', icon: Users },
        { section: 'sales' },
        { key: 'orders', icon: ScrollText },
        { key: 'plans', icon: Package },
        { key: 'subscribers', icon: Users },
        { key: 'loyalty', icon: Gift },
        { key: 'reviews', icon: Star },
    ];
    return (
        <div className="w-[20%] min-w-[86px] bg-[#0b0f1a] border-r border-white/[0.06] flex flex-col py-3 px-2.5 gap-1.5">
            <div className="flex items-center gap-1 px-1.5 mb-2">
                <div className="w-4 h-4 rounded-md bg-primary/90 flex items-center justify-center text-white text-[7px] font-black">N</div>
                <span className="text-white font-black text-[9px] tracking-tight">NEXT</span>
            </div>
            {items.map((it, i) => it.section ? (
                <div key={i} className="text-primary/70 text-[6px] font-black uppercase tracking-[0.15em] px-1.5 pt-2 pb-0.5">{nav[it.section]}</div>
            ) : (
                <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md ${active === it.key ? 'bg-primary/15 text-primary' : 'text-slate-400'}`}>
                    <it.icon className="w-2.5 h-2.5 shrink-0" />
                    <span className="text-[7.5px] font-semibold truncate">{nav[it.key]}</span>
                </div>
            ))}
            <div className="mt-auto flex items-center gap-1.5 px-1.5 py-1 text-red-400">
                <LogOut className="w-2.5 h-2.5" />
                <span className="text-[7.5px] font-semibold">{nav.logout}</span>
            </div>
        </div>
    );
}

function TopBar({ t }) {
    return (
        <div className="h-7 border-b border-white/[0.06] flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-full px-2 py-0.5">
                <Search className="w-2 h-2 text-slate-500" />
                <span className="text-[7px] text-slate-500">{t('mockups.search')}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-primary"><Wallet className="w-2.5 h-2.5" /><span className="text-[7px] font-semibold">{t('mockups.cashier')}</span></div>
                <div className="text-right leading-none">
                    <div className="text-[5.5px] text-slate-500 tracking-wider">{t('mockups.welcome')}</div>
                    <div className="text-[7px] text-white font-bold">Marcelo Geusti</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-primary/80" />
            </div>
        </div>
    );
}

export function MockAnalytics() {
    const { t } = useTranslation();
    const a = (k) => t(`mockups.a.${k}`);
    const bars = [30, 45, 25, 60, 40, 75, 55, 90, 65, 50, 70, 35];
    return (
        <div className="w-full aspect-[16/10] bg-[#0a0e17] flex text-left overflow-hidden select-none">
            <Sidebar t={t} active="analytics" />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar t={t} />
                <div className="flex-1 p-3 space-y-2 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-primary text-[6px] font-black uppercase tracking-[0.2em] flex items-center gap-1"><BarChart3 className="w-2 h-2" />{a('badge')}</div>
                            <div className="text-white font-extrabold text-[13px] leading-tight">{a('title')}</div>
                            <div className="text-slate-500 text-[7px]">{a('subtitle')}</div>
                        </div>
                        <div className="flex gap-1">
                            <div className="bg-white/[0.05] rounded px-1.5 py-0.5 text-[6px] text-slate-400">01/03/2026</div>
                            <div className="bg-white/[0.05] rounded px-1.5 py-0.5 text-[6px] text-slate-400">11/03/2026</div>
                        </div>
                    </div>
                    {/* Alertas */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-amber-500/10 border-l-2 border-amber-500 rounded-r px-2 py-1">
                            <div className="text-amber-400 text-[6px] font-black tracking-wide flex items-center gap-1"><Zap className="w-2 h-2" />{a('alert1Title')}</div>
                            <div className="text-slate-300 text-[6.5px]">{a('alert1Desc')}</div>
                        </div>
                        <div className="bg-primary/10 border-l-2 border-primary rounded-r px-2 py-1">
                            <div className="text-primary text-[6px] font-black tracking-wide flex items-center gap-1"><Clock className="w-2 h-2" />{a('alert2Title')}</div>
                            <div className="text-slate-300 text-[6.5px]">{a('alert2Desc')}</div>
                        </div>
                    </div>
                    {/* KPIs */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { l: a('kpiTicket'), v: 'R$ 93,75', s: a('kpiTicketSub'), badge: '+12%' },
                            { l: a('kpiRetention'), v: '100.0%', s: a('kpiRetentionSub'), badge: '+9%' },
                            { l: a('kpiForecast'), v: 'R$ 0,00', s: a('kpiForecastSub'), hi: true },
                            { l: a('kpiProfit'), v: 'R$ 375,00', s: a('kpiProfitSub') },
                        ].map((k, i) => (
                            <div key={i} className={`rounded-lg p-1.5 ${k.hi ? 'bg-primary/80' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                                <div className="flex justify-between items-start">
                                    <div className={`w-3 h-3 rounded ${k.hi ? 'bg-white/20' : 'bg-white/[0.06]'}`} />
                                    {k.badge && <span className="text-emerald-400 text-[5.5px] font-black bg-emerald-500/10 px-1 rounded">↑ {k.badge}</span>}
                                </div>
                                <div className={`text-[6px] mt-1 tracking-wide ${k.hi ? 'text-white/70' : 'text-slate-500'}`}>{k.l}</div>
                                <div className={`font-extrabold text-[11px] ${k.hi ? 'text-white' : 'text-white'}`}>{k.v}</div>
                                <div className={`text-[5.5px] ${k.hi ? 'text-white/60' : 'text-slate-600'}`}>{k.s}</div>
                            </div>
                        ))}
                    </div>
                    {/* Ranking + Serviços */}
                    <div className="grid grid-cols-[1.6fr_1fr] gap-2">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 relative overflow-hidden">
                            <div className="text-white text-[7px] font-bold flex items-center gap-1 mb-1.5"><Trophy className="w-2.5 h-2.5 text-amber-400" />{a('ranking')}</div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded bg-primary/20" />
                                    <div>
                                        <div className="text-white text-[7px] font-bold">Rafael Fonseca</div>
                                        <div className="text-slate-500 text-[5.5px]">{a('gross')}: R$ 375,00 · {a('commission')}: R$ 0,00</div>
                                    </div>
                                </div>
                                <div className="text-right"><div className="text-emerald-400 text-[9px] font-black">R$ 375,00</div><div className="text-slate-600 text-[5.5px]">{a('net')}</div></div>
                            </div>
                            <Trophy className="w-16 h-16 text-white/[0.03] absolute -right-2 -bottom-3" />
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                            <div className="text-white text-[7px] font-bold mb-1.5">{a('topServices')}</div>
                            <div className="flex items-center justify-between">
                                <div><div className="text-white text-[6.5px] font-semibold">Serviço</div><div className="text-slate-500 text-[5.5px]">4 {a('sales')}</div></div>
                                <div className="text-emerald-400 text-[8px] font-black">R$ 170,00</div>
                            </div>
                            <div className="mt-1.5 bg-primary/10 rounded px-1.5 py-0.5 text-primary text-[5.5px]">{a('insight')}</div>
                        </div>
                    </div>
                    {/* Picos + VIP */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                            <div className="text-white text-[7px] font-bold flex items-center gap-1 mb-1"><Clock className="w-2.5 h-2.5 text-primary" />{a('peakHours')}</div>
                            <div className="flex items-end gap-0.5 h-8">
                                {bars.map((b, i) => <div key={i} className="flex-1 bg-primary/40 rounded-t" style={{ height: `${b}%` }} />)}
                            </div>
                            <div className="text-slate-600 text-[5px] italic text-center mt-0.5">{a('peakHint')}</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                            <div className="text-white text-[7px] font-bold mb-1.5">{a('vip')}</div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /><span className="text-white text-[6.5px] font-semibold">Marcelo Geusti</span></div>
                                <span className="text-white text-[7px] font-black">R$ 375,00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MockAgenda() {
    const { t } = useTranslation();
    const g = (k) => t(`mockups.g.${k}`);
    const weekdays = t('mockups.g.weekdays');
    const slots = Array.isArray(weekdays) ? weekdays : ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    // dados de exemplo por dia (linha 1: dias 1-7, etc.)
    const cells = [
        [null, null, null, { j: '9 JOBS', appts: ['Marcelo Geusti', 'Marcelo Geusti', 'Marcelo Geusti'], more: 6 }, { j: '3 JOBS', appts: ['Marcelo Geusti', 'Marcelo Geusti', 'Marcelo Geusti'] }, null, { j: '4 JOBS', appts: ['Marcelo Geusti', 'Marcelo Geusti', 'Marcelo Geusti'], more: 1, red: 2 }],
        [{ j: '1 JOBS', appts: ['Marcelo Geusti'] }, { j: '1 JOBS', appts: ['Marcelo Geusti'] }, { j: '1 JOBS', appts: ['Marcelo Geusti'] }, { j: '77 JOBS', appts: ['João Silva', 'João Silva', 'Carlos Souza'], more: 74, today: true }, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
    ];
    let day = 1;
    return (
        <div className="w-full aspect-[16/12] bg-[#0a0e17] flex text-left overflow-hidden select-none">
            <Sidebar t={t} active="schedule" />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar t={t} />
                <div className="flex-1 p-3 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-extrabold text-[13px] tracking-tight">{g('title')}</div>
                        <div className="flex items-center gap-1.5">
                            <div className="bg-white/[0.04] rounded px-2 py-0.5 flex items-center gap-1 text-[6.5px] text-slate-300 font-semibold"><UserCheck className="w-2 h-2" />{g('allPros')}</div>
                            <div className="flex bg-white/[0.04] rounded overflow-hidden text-[6.5px] font-bold">
                                <span className="px-1.5 py-0.5 text-slate-400">{g('day')}</span>
                                <span className="px-1.5 py-0.5 text-slate-400">{g('week')}</span>
                                <span className="px-1.5 py-0.5 bg-primary text-white">{g('month')}</span>
                            </div>
                            <div className="text-slate-400 text-[6.5px] flex items-center gap-1"><Printer className="w-2 h-2" />{g('print')}</div>
                            <div className="bg-white text-black rounded px-1.5 py-0.5 text-[6.5px] font-bold flex items-center gap-1"><Zap className="w-2 h-2" />{g('quickFit')}</div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-3 border-b border-white/[0.06] mb-1.5">
                        <span className="text-primary text-[6.5px] font-bold border-b-2 border-primary pb-1">{g('tabAppointments')}</span>
                        <span className="text-slate-500 text-[6.5px] font-bold pb-1">{g('tabWaitlist')}</span>
                        <span className="text-slate-500 text-[6.5px] font-bold pb-1">{g('tabFree')}</span>
                    </div>
                    {/* Weekday header */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {slots.map((d, i) => <div key={i} className="text-slate-500 text-[6px] font-black tracking-wider text-center">{d}</div>)}
                    </div>
                    {/* Grid */}
                    <div className="flex-1 grid grid-rows-4 gap-1 min-h-0">
                        {cells.map((row, r) => (
                            <div key={r} className="grid grid-cols-7 gap-1">
                                {row.map((cell, c) => {
                                    const d = day++;
                                    return (
                                        <div key={c} className="bg-white/[0.02] border border-white/[0.05] rounded p-1 flex flex-col min-h-0 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[6.5px] font-bold ${cell?.today ? 'bg-primary text-white rounded-full w-3 h-3 flex items-center justify-center' : 'text-slate-400'}`}>{d}</span>
                                                {cell?.j && <span className="text-primary text-[5px] font-black bg-primary/10 px-1 rounded">{cell.j}</span>}
                                            </div>
                                            {cell?.appts?.slice(0, 3).map((name, ai) => (
                                                <div key={ai} className={`mt-0.5 rounded px-1 py-[1px] text-[5px] font-semibold truncate ${cell.red === ai ? 'bg-red-500/15 text-red-400' : 'bg-primary/10 text-slate-300'}`}>{name}</div>
                                            ))}
                                            {cell?.more && <div className="text-primary text-[5px] font-bold mt-0.5">+ {cell.more} {g('moreSlots')}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MockBooking() {
    const { t } = useTranslation();
    const b = (k) => t(`mockups.b.${k}`);
    const tabs = t('mockups.b.tabs');
    const tabList = Array.isArray(tabs) ? tabs : [];
    const services = [
        { n: 'Mid Fade', p: 'R$ 45,00', m: '35' },
        { n: 'High Fade', p: 'R$ 45,00', m: '35' },
        { n: 'Pompadour', p: 'R$ 55,00', m: '45' },
        { n: 'Barba Tradicional', p: 'R$ 25,00', m: '20' },
        { n: 'Barba Premium', p: 'R$ 35,00', m: '30' },
        { n: 'Corte + Barba', p: 'R$ 65,00', m: '60' },
    ];
    return (
        <div className="h-full bg-[#05070d] flex flex-col text-left overflow-hidden select-none" style={{ aspectRatio: '566 / 1024' }}>
            {/* Banner */}
            <div className="relative h-[18%] bg-gradient-to-br from-[#1a2540] to-[#0a1020] flex items-center justify-center shrink-0">
                <ChevronLeft className="w-3 h-3 text-white/70 absolute left-2 top-2" />
                <span className="text-white/90 font-black text-2xl tracking-tight">NEXT</span>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary border-2 border-[#05070d]" />
            </div>
            <div className="text-center mt-4 shrink-0">
                <div className="text-amber-400 text-[7px]">★★★★★ <span className="text-slate-400">5.0</span></div>
            </div>
            {/* Sugestão */}
            <div className="px-3 mt-2 shrink-0">
                <div className="text-amber-400 text-[6px] font-black tracking-wide mb-1">★ {b('suggestions')}</div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex items-center justify-between">
                    <div>
                        <span className="bg-amber-500/20 text-amber-400 text-[5px] font-black px-1 py-0.5 rounded">{b('popular')}</span>
                        <div className="text-white text-[8px] font-bold mt-0.5">Low Fade</div>
                        <div className="text-emerald-400 text-[6px] font-semibold">R$ 40,00</div>
                    </div>
                    <Star className="w-3 h-3 text-amber-400" />
                </div>
            </div>
            {/* Tabs */}
            <div className="px-3 mt-2 flex gap-2 overflow-hidden shrink-0">
                {tabList.map((tb, i) => (
                    <span key={i} className={`text-[5.5px] font-bold whitespace-nowrap pb-1 ${i === 0 ? 'text-primary border-b border-primary' : 'text-slate-500'}`}>{tb}</span>
                ))}
            </div>
            {/* Serviços */}
            <div className="flex-1 px-3 py-2 space-y-1.5 overflow-hidden">
                {services.map((s, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center shrink-0"><Scissors className="w-2.5 h-2.5 text-emerald-400" /></div>
                            <div className="min-w-0">
                                <div className="text-white text-[7px] font-bold truncate">{s.n}</div>
                                <div className="flex gap-1 mt-0.5">
                                    <span className="text-emerald-400 text-[5px] bg-emerald-500/10 px-1 rounded">{s.p}</span>
                                    <span className="text-slate-400 text-[5px] bg-white/[0.04] px-1 rounded">{s.m} {b('min')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white text-black rounded px-2 py-1 text-[5.5px] font-black flex items-center gap-0.5 shrink-0">{b('book')} <ChevronRight className="w-2 h-2" /></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
