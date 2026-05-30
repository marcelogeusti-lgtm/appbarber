'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent, useTransform } from 'framer-motion';

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
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120, // Velocidade de resposta
    damping: 30,    // Amortecimento para não ficar elástico
    mass: 0.5,      // Peso do movimento
    restDelta: 0.001
  });

  /* Sincroniza o `currentTime` do vídeo com a porcentagem do scroll */
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      // Tempo do vídeo = Porcentagem do Scroll (0 a 1) x Duração do Vídeo
      videoRef.current.currentTime = latest * videoRef.current.duration;
    }
  });

  /* Os textos iniciais somem suavemente para não ficarem em cima da tela verde */
  const textOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const textY       = useTransform(smoothProgress, [0, 0.15], [0, -20]);

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
            src="/dashboard-video.mp4" /* O seu novo vídeo foi copiado pra cá */
            muted
            playsInline
            preload="auto"
            /* 
               object-cover força o vídeo a preencher 100% do tamanho da tela
               sem deixar bordas pretas nas laterais.
            */
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        </div>

        {/* ── TÍTULO INICIAL ── */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }} 
          className="absolute top-20 left-0 w-full text-center z-20 px-4 pointer-events-none"
        >
          <p className="text-xs text-white/30 uppercase mb-4 tracking-[0.35em] drop-shadow-md">
            Visão 360 do seu negócio
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight drop-shadow-xl">
            <span className="font-bold">O Painel de Controle</span><br />
            <span className="text-white/65 italic">do Seu Império</span>
          </h2>
        </motion.div>

        {/* ── DICA DE SCROLL (Seta animada) ── */}
        <motion.div 
          style={{ opacity: textOpacity }} 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
        >
          <p className="text-white/25 text-[10px] uppercase drop-shadow-md" style={{ letterSpacing: '0.3em' }}>
            Role para explorar
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
