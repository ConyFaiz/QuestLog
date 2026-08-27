export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return 'No Due Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const today = new Date();
  const todayStr = getTodayString();
  
  if (dateString === todayStr) return 'Hari Ini';
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (dateString === tomorrowStr) return 'Besok';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1.split('T')[0] === date2.split('T')[0];
};

export const daysBetween = (date1Str: string, date2Str: string): number => {
  const d1 = new Date(date1Str.split('T')[0]);
  const d2 = new Date(date2Str.split('T')[0]);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
