import { toWesternDigits } from "../../utilities/persian-digits.util";

export function formatSectionTitleWithCount(title: string, count: number): string {
  return `${title} (${toWesternDigits(String(count))})`;
}
