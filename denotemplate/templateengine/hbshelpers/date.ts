export const dateHelper = (isoString: string, locale: string): string => {
   const date = new Date(isoString)
   const year = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
   const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
   const day = new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date);
   return `${day}-${month}-${year}`
}