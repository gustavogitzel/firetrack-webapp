import { useState } from 'react';
import { ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { useAtom } from 'jotai';
import { currentJourneyAtom } from './state/app.atoms';
import { MapPage } from './features/map/components/MapPage';

export function App() {
  const [journey] = useAtom(currentJourneyAtom);

  if (journey === 'map') {
    return <MapPage />;
  }

  return <LandingPage />;
}

function LandingPage() {
  const [, setJourney] = useAtom(currentJourneyAtom);
  const [entered, setEntered] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => {
      setShowCarousel(true);
    }, 600);
  };

  const startJourney = () => {
    setJourney('map');
  };

  const carouselItems = [
    { 
      imgUrl: 'https://picsum.photos/seed/firetrack1/1200/800', 
      title: 'Cobertura Global', 
      desc: 'Dados de satélite atualizados para todo o globo em tempo quase real.' 
    },
    { 
      imgUrl: 'https://picsum.photos/seed/firetrack2/1200/800', 
      title: 'Monitoramento Contínuo', 
      desc: 'Acompanhe as variações e evolução das anomalias térmicas.' 
    },
    { 
      imgUrl: 'https://picsum.photos/seed/firetrack3/1200/800', 
      title: 'Alertas Críticos', 
      desc: 'Notificações automáticas para eventos em áreas de risco.' 
    },
    { 
      imgUrl: 'https://picsum.photos/seed/firetrack4/1200/800', 
      title: 'Análise Avançada', 
      desc: 'Gere relatórios precisos baseados em dados históricos e espaciais.' 
    },
  ];

  const nextSlide = () => setCarouselIndex((i) => (i + 1) % carouselItems.length);
  const prevSlide = () => setCarouselIndex((i) => (i - 1 + carouselItems.length) % carouselItems.length);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-red-400 to-red-600 select-none flex items-center justify-center">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-white/20 rounded-full mix-blend-overlay filter blur-[100px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-red-300/30 rounded-full mix-blend-overlay filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-1/4 left-1/2 w-[60vw] h-[60vw] bg-white/20 rounded-full mix-blend-overlay filter blur-[150px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Central Logo Container (White Glassmorphic) */}
      <button 
        onClick={handleEnter}
        className={`absolute z-10 group flex flex-col items-center justify-center p-12 md:p-20 rounded-[3rem] bg-white/10 backdrop-blur-3xl border border-white/30 shadow-2xl transition-all duration-[800ms] ease-in-out hover:bg-white/20 cursor-pointer ${
          entered ? 'scale-[4] opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-105'
        }`}
      >
        <div className="absolute inset-0 bg-white/0 rounded-[3rem] blur-2xl transition-all duration-700 group-hover:bg-white/20" />
        
        <div className="relative mb-6 drop-shadow-xl transition-all duration-700 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
          <FireTrackLogo size="lg" />
        </div>
        
        <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700 text-white/90 text-sm font-semibold tracking-widest uppercase">
          Entrar
        </div>
      </button>

      {/* Carousel Container */}
      <div 
        className={`absolute z-20 flex items-center justify-center w-full max-w-5xl px-12 md:px-20 transition-all duration-700 ease-out ${
          showCarousel ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="relative w-full p-4 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl flex items-center justify-center flex-col">
          
          {/* Main Carousel Viewport */}
          <div className="relative w-full flex items-center justify-center">
            {/* Previous Arrow (Left Extremity) */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 -ml-6 md:-ml-8 z-30 p-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-white hover:bg-white/40 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <div className="relative w-full overflow-hidden rounded-[2rem] aspect-video">
              <div 
                className="flex h-full transition-transform duration-500 ease-in-out cursor-grab active:cursor-grabbing"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {carouselItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`w-full h-full flex-shrink-0 relative ${idx === 0 ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
                    onClick={idx === 0 ? startJourney : undefined}
                  >
                    <img src={item.imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    
                    {/* Text Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 pt-32 bg-gradient-to-t from-red-950/90 via-red-950/40 to-transparent flex flex-col justify-end pointer-events-none">
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                        {item.title}
                      </h2>
                      <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed drop-shadow max-w-2xl">
                        {item.desc}
                      </p>
                      {idx === 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 text-white/80 text-sm uppercase tracking-widest font-bold">
                          <span>Clique para acessar o Mapa</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Arrow (Right Extremity) */}
            <button 
              onClick={nextSlide}
              className="absolute right-0 -mr-6 md:-mr-8 z-30 p-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-white hover:bg-white/40 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Dots Indicator & Action Button */}
          <div className="relative w-full flex items-center justify-center mt-6 h-12">
            <div className="flex gap-3">
              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer shadow-sm ${idx === carouselIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>

            <button 
              onClick={startJourney}
              className="absolute right-4 flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold transition-all hover:scale-105"
            >
              <Map className="w-5 h-5" />
              <span>Acessar Mapa</span>
            </button>
          </div>

        </div>
      </div>

    </main>
  );
}

interface FireTrackLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export function FireTrackLogo({
  size = 'md',
  showBadge = true,
  className = '',
}: FireTrackLogoProps) {
  const sizeStyles = {
    sm: { text: 'text-xl', tracker: 'stroke-[2px]', h: 'h-6' },
    md: { text: 'text-3xl', tracker: 'stroke-[2.4px]', h: 'h-9' },
    lg: { text: 'text-5xl', tracker: 'stroke-[3px]', h: 'h-14' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Contêiner da Palavra */}
      <div className="flex items-center tracking-tight">
        {/* FIRE: Sólido, Bold e Branco */}
        <span
          className={`font-black text-white tracking-[-0.03em] ${sizeStyles.text} drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]`}
        >
          FIRE
        </span>

        {/* Linha Divisória de Isolinha */}
        <span className="mx-2.5 h-6 border-r-2 border-dashed border-white/30" />

        {/* TRACK: Estilo Contorno / Curva Topográfica */}
        <span
          className={`font-extrabold tracking-[0.08em] ${sizeStyles.text} text-transparent`}
          style={{
            WebkitTextStroke: size === 'sm' ? '1.2px #FFFFFF' : '1.8px #FFFFFF',
          }}
        >
          TRACK
        </span>
      </div>

      {/* Badge Minimalista de Satélite (Opcional) */}
      {showBadge && (
        <span className="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[9px] font-mono tracking-widest font-semibold uppercase text-rose-200 bg-white/10 rounded-md border border-white/20 backdrop-blur-xs">
          NRT
        </span>
      )}
    </div>
  );
}
