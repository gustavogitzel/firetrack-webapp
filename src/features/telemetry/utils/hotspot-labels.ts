export const HOTSPOT_SOURCE_COLORS: Record<string, string> = {
  INPE: '#f97316',
  NASA_FIRMS: '#facc15',
};

export const HOTSPOT_SOURCE_LABELS: Record<string, string> = {
  INPE: 'INPE',
  NASA_FIRMS: 'NASA FIRMS',
};

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: 'Baixa',
  nominal: 'Nominal',
  high: 'Alta',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
