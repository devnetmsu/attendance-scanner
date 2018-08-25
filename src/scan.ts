import { InvalidSwipe } from "./errors";

interface CardSwipeInfo {
  netId: string;
  studentId: string;
}

const cardRegex = /^\%(.*)\?;(\d{9})=(\d{4})\?$/;

/**
 * Parses the data read from a MSU ID into a netId and a nine-digit studentId
 *
 * @param data The information read from a MSU ID
 * @returns an object caontaing the studentId and netId properties
 */
export function parseCardSwipe(data: string): CardSwipeInfo {
  if (!cardRegex.test(data)) throw new InvalidSwipe();
  const match = data.match(cardRegex);
  return { netId: match[1].toLowerCase(), studentId: match[2] };
}
