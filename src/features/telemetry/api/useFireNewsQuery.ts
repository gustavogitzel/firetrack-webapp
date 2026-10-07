import { useQuery } from '@tanstack/react-query';

export interface FireNewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  snippet: string;
  url: string;
  relevanceScore?: number;
}

function scoreArticle(
  item: any,
  city: string,
  state: string,
  targetIsoDate?: string | null,
): number {
  const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
  const cityLower = city.toLowerCase();
  const stateLower = (state || '').toLowerCase();

  let score = 0;

  // City mention bonus (crucial requirement)
  if (cityLower && text.includes(cityLower)) {
    score += 150;
  }

  // State mention bonus
  if (stateLower && text.includes(stateLower)) {
    score += 30;
  }

  // Fire keywords bonus
  if (
    text.includes('incêndio') ||
    text.includes('queimada') ||
    text.includes('fogo') ||
    text.includes('florestal')
  ) {
    score += 80;
  }

  // Date proximity score: highest points for articles published closest to event date
  if (targetIsoDate && item.pubDate) {
    const targetMs = new Date(targetIsoDate).getTime();
    const itemMs = new Date(item.pubDate).getTime();
    if (!isNaN(targetMs) && !isNaN(itemMs)) {
      const diffDays = Math.abs(targetMs - itemMs) / (1000 * 60 * 60 * 24);
      const dateBonus = Math.max(0, 200 - diffDays * 1.5);
      score += dateBonus;
    }
  }

  return score;
}

export function useFireNewsQuery(
  municipality?: string | null,
  state?: string | null,
  eventDate?: string | null,
) {
  return useQuery({
    queryKey: ['news', municipality, state, eventDate],
    queryFn: async (): Promise<FireNewsArticle[]> => {
      const city = municipality ? municipality.trim() : '';
      const uf = state ? state.trim() : '';
      const locQuery = city ? `${city} ${uf}`.trim() : 'Brasil';

      // Query Google News RSS for specific city fire incidents
      const queryStr = `incêndio queimada ${locQuery}`.trim();
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        queryStr,
      )}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            // Score & sort articles by city mention and date proximity
            const scoredArticles: { article: FireNewsArticle; score: number }[] = data.items
              .map((item: any, idx: number) => {
                const score = scoreArticle(item, city || 'Brasil', uf, eventDate);

                // Parse title and source: Title usually comes as "Title text - Source Name"
                const titleParts = (item.title || '').split(' - ');
                const source = titleParts.length > 1 ? titleParts.pop() : 'Imprensa';
                const cleanTitle = titleParts.join(' - ') || item.title;

                // Format date
                let dateStr = item.pubDate || 'Recente';
                if (item.pubDate) {
                  try {
                    const d = new Date(item.pubDate);
                    if (!isNaN(d.getTime())) {
                      dateStr = d.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    }
                  } catch {
                    /* ignore */
                  }
                }

                // Strip HTML tags from description snippet
                const rawDesc = item.description || item.content || '';
                const cleanSnippet =
                  rawDesc.replace(/<[^>]*>?/gm, '').trim() ||
                  `Notícia de incêndio e queimadas na cidade de ${locQuery}.`;

                return {
                  article: {
                    id: item.guid || item.link || `news-${idx}`,
                    title: cleanTitle,
                    source: source || 'Imprensa',
                    publishedAt: dateStr,
                    snippet: cleanSnippet,
                    url: item.link || rssUrl,
                    relevanceScore: score,
                  },
                  score,
                };
              })
              .sort(
                (a: { score: number }, b: { score: number }) => b.score - a.score,
              );

            return scoredArticles.slice(0, 5).map((s) => s.article);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch RSS news feed:', err);
      }

      // Fallback search URL
      const directSearchUrl = `https://news.google.com/search?q=${encodeURIComponent(
        `incêndio queimada ${locQuery}`,
      )}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

      return [
        {
          id: 'news-fallback-1',
          title: `Reportagens e cobertura de incêndios em ${locQuery}`,
          source: 'Imprensa Regional',
          publishedAt: eventDate
            ? new Date(eventDate).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })
            : 'Recente',
          snippet: `Acompanhe as matérias e coberturas jornalísticas das queimadas ocorridas na cidade de ${locQuery}.`,
          url: directSearchUrl,
        },
      ];
    },
    enabled: !!municipality || !!state,
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
}
