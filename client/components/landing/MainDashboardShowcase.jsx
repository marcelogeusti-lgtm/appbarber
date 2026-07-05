import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';
import { MockAnalytics, MockAgenda, MockBooking } from './DashboardMockups';

// Mockups HTML (texto traduzível) no lugar dos prints .png
const slideMeta = [
  { id: 0, Mock: MockAnalytics },
  { id: 1, Mock: MockAgenda },
  { id: 2, Mock: MockBooking },
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    scale: 0.85,
    opacity: 0,
    filter: 'blur(10px)',
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    scale: 0.85,
    opacity: 0,
    filter: 'blur(10px)',
  })
};

/*
  ABORDAGEM: VIDEO SCRUBBING NATIVO (APPLE STYLE)
  Nenhuma movimentação falsa em CSS.
  A linha do tempo do vídeo é mapeada diretamente para o scroll do mouse.
  Rolar para baixo -> Avança o vídeo
  Rolar para cima  -> Retrocede o vídeo
*/
export default function MainDashboardShowcase() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { t } = useTranslation();

  const slideCaptions = t('mockups.slides');
  const captions = Array.isArray(slideCaptions) ? slideCaptions : [];
  const slides = slideMeta.map((m, i) => ({
    ...m,
    title: captions[i]?.title || '',
    description: captions[i]?.description || '',
  }));

  /* Estado do Carrossel */
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    let newPage = page + newDirection;
    if (newPage < 0) newPage = slides.length - 1;
    if (newPage >= slides.length) newPage = 0;
    setPage([newPage, newDirection]);
  };

  /* 
    Usamos 600vh de altura para que a seção "trave" (sticky).
    Enquanto o usuário rola esses 600vh (invisíveis), a variável `scrollYProgress` 
    vai de 0 até 1. 
  */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* 
    useSpring: Pega os trancos da rodinha do mouse e transforma numa curva fluida.
    Isso é o que dá a "fluidez premium" sem engasgar o vídeo.
  */
  /* 
    Deixamos a mola mais "rígida" e com menos amortecimento.
    Isso faz o vídeo responder quase que instantaneamente ao seu dedo,
    (rápido se rolar rápido, devagar se rolar devagar), 
    mas ainda suaviza os "trancos" da rodinha do mouse.
  */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400, 
    damping: 40,    
    mass: 0.1,      
    restDelta: 0.001
  });

  /* HACK PARA iOS/MOBILE: Força o carregamento do vídeo para evitar a tela preta no scroll */
  useEffect(() => {
    if (videoRef.current) {
      // Um micro-play força o iOS a alocar o decodificador de hardware
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          videoRef.current.pause();
        }).catch(() => {
          // Ignora erros de autoplay bloqueado
        });
      }
    }
  }, []);

  /* Sincroniza o `currentTime` do vídeo com a porcentagem do scroll */
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = latest * videoRef.current.duration;
    }
  });

  /* Os textos iniciais somem suavemente para não ficarem em cima da tela */
  const textOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const textY       = useTransform(smoothProgress, [0, 0.15], [0, -20]);

  /* O Carrossel e o Fundo aparecem nos últimos 15% do vídeo, com um leve zoom para simular a tela ligando e aproximando */
  const carouselOpacity = useTransform(smoothProgress, [0.85, 0.95], [0, 1]);
  const carouselScale   = useTransform(smoothProgress, [0.85, 0.95], [0.95, 1]);
  const pointerEvents   = useTransform(smoothProgress, (val) => val > 0.9 ? 'auto' : 'none');

  return (
    <section ref={containerRef} className="relative bg-[#050505]" style={{ height: '600vh' }}>
      
      {/* ── STICKY VIEWPORT ── 
          Isso garante que a seção ocupe 100% da tela e fique fixa 
          enquanto o usuário rola pelos 600vh da seção pai. 
      */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#050505]">
        
        {/* ── VÍDEO EXPANDIDO EM TELA CHEIA ── */}
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            src="/dashboard-video.mp4" 
            muted
            playsInline
            loop
            preload="auto"
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        </div>

        {/* ── TÍTULO INICIAL ── */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }} 
          className="absolute top-20 left-0 w-full text-center z-20 px-4 pointer-events-none"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight drop-shadow-xl mb-4">
            {t('mockups.intro.title1')} <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('mockups.intro.highlight')}</span>
          </h2>
          <p className="font-body text-slate-400 text-lg max-w-xl mx-auto mb-8 font-medium">
            {t('mockups.intro.subtitle')}
          </p>
        </motion.div>

        {/* ── DICA DE SCROLL (Seta animada) ── */}
        <motion.div 
          style={{ opacity: textOpacity }} 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
        >
          <p className="text-white/25 text-[10px] uppercase drop-shadow-md font-body font-medium" style={{ letterSpacing: '0.3em' }}>
            {t('mockups.intro.scroll')}
          </p>
          <div className="w-[18px] h-7 rounded-full border border-white/20 flex items-start justify-center pt-1 bg-black/20 backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[5px] h-[5px] rounded-full bg-white/40"
            />
          </div>
        </motion.div>

        {/* 
          ── CARROSSEL DO PAINEL (Aparece no final do vídeo) ── 
          Ao usar bg-[#050505] sólido, nós cobrimos totalmente a "tela verde" do vídeo 
          usando a exata cor da sua paleta dark.
        */}
        <motion.div 
          style={{ opacity: carouselOpacity, scale: carouselScale, pointerEvents }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]"
        >
          <div className="relative w-full max-w-[1400px] px-4 md:px-8 flex items-center justify-between h-full gap-4">
            
            {/* Botão Voltar (Fora do conteúdo) */}
            <button 
              onClick={() => paginate(-1)}
              className="z-40 p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shrink-0"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Slider container (ocupa todo o espaço central) */}
            <div className="flex-1 h-full max-h-[80vh] flex items-center justify-center relative overflow-hidden [perspective:2000px] px-2 md:px-8">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.3 }, scale: { duration: 0.4 } }}
                  className="w-full flex flex-col lg:flex-row items-center gap-8 md:gap-12 absolute"
                >
                  {/* Coluna do Mockup (HTML traduzível) */}
                  <div className="flex-1 w-full flex justify-center lg:justify-end">
                    {(() => {
                      const SlideMock = slides[page].Mock;
                      return slides[page].id === 2 ? (
                        <div className="relative h-[60vh] md:h-[65vh] rounded-[1.75rem] overflow-hidden border-4 border-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          <SlideMock />
                        </div>
                      ) : (
                        <div className="relative w-full max-w-2xl rounded-xl md:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                          <SlideMock />
                          <div className="absolute inset-0 rounded-xl md:rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Coluna de Texto (Direita) */}
                  <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-4 md:gap-6 text-center lg:text-left shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 mx-auto lg:mx-0">
                       <span className="text-primary font-bold text-lg">{page + 1}</span>
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {slides[page].title.split(' ')[0]} <br className="hidden lg:block"/>
                      <span className="text-white/40">{slides[page].title.split(' ').slice(1).join(' ')}</span>
                    </h3>
                    <p className="font-body text-base md:text-lg text-white/60 leading-relaxed font-medium">
                      {slides[page].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Botão Avançar (Fora do conteúdo) */}
            <button 
              onClick={() => paginate(1)}
              className="z-40 p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shrink-0"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

          </div>
        </motion.div>

        {/* 
          BARRA DE PROGRESSO DO SCROLL (Linha discreta no rodapé) 
          Para que você saiba em qual ponto do scroll você está.
        */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5 z-50">
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            className="h-full bg-white/20"
          />
        </div>

      </div>
    </section>
  );
}
