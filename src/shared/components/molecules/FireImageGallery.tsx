import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  Maximize2,
  X,
  Satellite,
  Camera,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { FireImage } from '@/features/telemetry/api/useFireImagesQuery';

interface FireImageGalleryProps {
  images: FireImage[];
  locationName?: string;
}

export function FireImageGallery({ images, locationName }: FireImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<FireImage | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!images || images.length === 0) return null;

  const handleOpenImage = (img: FireImage) => {
    setActiveImage(img);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(prev + 0.2, 4));
    } else {
      setZoomScale((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-white/50 px-1">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
            Imagens da Região & Satélite
          </span>
        </div>
        <span className="text-[10px] text-white/40 font-mono">
          {images.length} fotos
        </span>
      </div>

      {/* Grid of Image Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => handleOpenImage(img)}
            className="group relative h-28 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 cursor-pointer transition-all duration-300 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <img
              src={img.thumbnailUrl}
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />

            {/* Type Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white/80 flex items-center gap-1">
              {img.type === 'satellite' ? (
                <>
                  <Satellite className="w-2.5 h-2.5 text-sky-400" />
                  <span>Satélite</span>
                </>
              ) : (
                <>
                  <Camera className="w-2.5 h-2.5 text-amber-400" />
                  <span>Foto</span>
                </>
              )}
            </div>

            {/* Hover Expand Icon */}
            <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 backdrop-blur-md text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3" />
            </div>

            {/* Title & Date Footer */}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                {img.title}
              </p>
              <p className="text-[8px] text-white/50 font-mono mt-0.5">
                {img.source} • {img.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top-Level Fullscreen Modal Portal (renders at document.body level) */}
      {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
            onClick={() => setActiveImage(null)}
          >
            {/* Main Modal Container */}
            <div
              className="relative w-full max-w-4xl h-[85vh] max-h-[720px] bg-neutral-950/95 backdrop-blur-3xl border border-white/15 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Eye className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Visualização de Imagem Orbital & Campo HD
                      </h3>
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeImage.type === 'satellite' ? 'Satélite' : 'Fotojornalismo'}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                      <span>{locationName || 'Região de Monitoramento'}</span>
                      <span className="text-white/30">•</span>
                      <span className="font-mono text-white/40">{activeImage.source}</span>
                    </p>
                  </div>
                </div>

                {/* Header Controls & Close */}
                <div className="flex items-center gap-2">
                  {/* Zoom Toolbar */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-xl">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomScale <= 1}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Diminuir zoom (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-amber-400 min-w-[40px] text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoomScale >= 4}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Aumentar zoom (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetZoom}
                      disabled={zoomScale === 1 && panOffset.x === 0 && panOffset.y === 0}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer ml-1"
                      title="Resetar Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveImage(null)}
                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Interactive Viewport Area */}
              <div
                className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden ${
                  zoomScale > 1
                    ? isDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-zoom-in'
                }`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  className="max-h-full w-auto max-w-full object-contain pointer-events-none select-none"
                />

                {/* Floating Instructions Bar */}
                <div className="absolute bottom-3 left-4 z-10 px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-[10px] text-white/70 font-mono flex items-center gap-2 shadow-lg">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {zoomScale > 1
                      ? 'Clique e arraste para navegar • Scroll para zoom • Duplo clique para resetar'
                      : 'Duplo clique na imagem ou use o scroll para aproximar'}
                  </span>
                </div>
              </div>

              {/* Modal Footer (matching StreetViewModal notice style) */}
              <div className="px-6 py-4 border-t border-white/10 bg-neutral-900/90 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/50 font-mono">
                  <span className="font-bold text-white text-sm leading-tight">
                    {activeImage.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span>Fonte: {activeImage.source}</span>
                    <span>•</span>
                    <span>Data: {activeImage.date}</span>
                  </div>
                </div>

                {/* Detailed Description */}
                {activeImage.description && (
                  <p className="text-xs text-white/75 leading-relaxed bg-white/[0.03] border border-white/10 p-3 rounded-2xl font-sans">
                    {activeImage.description}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
