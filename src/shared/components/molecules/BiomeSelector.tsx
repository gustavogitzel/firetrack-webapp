import { Leaf } from 'lucide-react';
import { useAtom } from 'jotai';
import { BIOMES, biomeFilterAtom } from '@/state/filters.atoms';
import type { Biome } from '@/state/filters.atoms';

interface BiomeSelectorProps {
  className?: string;
}

export function BiomeSelector({ className = '' }: BiomeSelectorProps) {
  const [biome, setBiome] = useAtom(biomeFilterAtom);

  return (
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl ${className}`}
    >
      <div className="px-2.5 flex items-center gap-2 text-white/50 border-r border-white/10 shrink-0">
        <Leaf className="w-4 h-4 text-red-400" />
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
          Bioma
        </span>
      </div>
      <select
        value={biome ?? ''}
        onChange={(e) => setBiome((e.target.value || null) as Biome | null)}
        aria-label="Filtrar por bioma"
        className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-transparent focus:outline-none cursor-pointer border ${
          biome
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'text-white/70 border-transparent hover:bg-white/10'
        }`}
      >
        <option value="" className="bg-neutral-900 text-white">Todos</option>
        {BIOMES.map((name) => (
          <option key={name} value={name} className="bg-neutral-900 text-white">
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
