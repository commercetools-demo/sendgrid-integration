export const convertDateToText = (isoDate: string, locale: string) => {
  const asDate = new Date(isoDate);
  const date = asDate.toLocaleDateString(locale);
  const time = asDate.toLocaleTimeString(locale);
  return { date: date, time: time, dateTime: `${date} ${time}` };
};
