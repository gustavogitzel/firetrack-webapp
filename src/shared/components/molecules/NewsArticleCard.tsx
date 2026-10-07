import { ExternalLink, Newspaper } from 'lucide-react';
import type { FireNewsArticle } from '@/features/telemetry/api/useFireNewsQuery';

interface NewsArticleCardProps {
  article: FireNewsArticle;
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  return (
    <div className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-all select-none space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sky-400">
          <Newspaper className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {article.source}
          </span>
        </div>
        <span className="text-[9px] text-white/40 font-mono">
          {article.publishedAt}
        </span>
      </div>

      <h5 className="text-xs font-bold text-white leading-snug group-hover:text-sky-300 transition-colors">
        {article.title}
      </h5>

      <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
        {article.snippet}
      </p>

      <div className="pt-1 flex items-center justify-end">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
        >
          <span>Ler Notícia Completa</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
