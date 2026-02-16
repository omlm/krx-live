export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Nullstill tidspunkt for sammenligning
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'I KVELD';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'I MORGEN';
  } else {
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

export function groupConcertsByDate(concerts: any[]) {
  const grouped: { [key: string]: any[] } = {};

  concerts.forEach((concert) => {
    const dateLabel = formatDate(concert.date);
    if (!grouped[dateLabel]) {
      grouped[dateLabel] = [];
    }
    grouped[dateLabel].push(concert);
  });

  // Sorter gruppene: I KVELD, I MORGEN, deretter datoer
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'I KVELD') return -1;
    if (b === 'I KVELD') return 1;
    if (a === 'I MORGEN') return -1;
    if (b === 'I MORGEN') return 1;
    return new Date(a.split('.').reverse().join('-')).getTime() - 
           new Date(b.split('.').reverse().join('-')).getTime();
  });

  const result: { [key: string]: any[] } = {};
  sortedKeys.forEach((key) => {
    result[key] = grouped[key];
  });

  return result;
}
