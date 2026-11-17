import { useState } from 'react';
import { Info } from 'lucide-react';

const SUBJECT_TEXT = {
  event: 'Este evento agrupa focos de calor captados por satélites a até 3 km e 12 h uns dos outros.',
  hotspot: 'Este ponto marca um calor anormal captado por um sensor em órbita.',
};

interface SatelliteDetectionInfoProps {
  subject: keyof typeof SUBJECT_TEXT;
  align?: 'left' | 'right';
}

export function SatelliteDetectionInfo({ subject, align = 'left' }: SatelliteDetectionInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex group">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        aria-label="O que significa uma detecção por satélite"
        aria-expanded={isOpen}
        className="p-0.5 rounded-full text-white/40 hover:text-white focus:text-white focus:outline-none cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <span
        role="tooltip"
        className={`absolute top-full mt-2 z-20 w-60 p-3 rounded-xl bg-neutral-900 border border-white/15 shadow-2xl text-left normal-case tracking-normal ${
          align === 'left' ? 'left-0' : 'right-0'
        } ${isOpen ? 'block' : 'hidden group-hover:block'}`}
      >
        <span className="block text-[11px] font-bold text-white mb-1">Detecção por satélite, não confirmação em solo</span>
        <span className="block text-[10px] leading-relaxed font-medium text-white/60">
          {SUBJECT_TEXT[subject]} Ninguém verificou no local: pode ser incêndio florestal, queimada agrícola, fonte
          industrial de calor ou reflexo do sol. A posição tem margem de erro de 375 m a 2 km, conforme o satélite.
        </span>
      </span>
    </span>
  );
}
