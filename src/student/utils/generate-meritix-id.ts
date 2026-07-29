export function generateMeritixId(lastId: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const sequence = (lastId + 1).toString().padStart(7, '0');

  return `MX${year}${sequence}`;
}
