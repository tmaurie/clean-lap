export function countryToFlagEmoji(country: string): string {
  const countryCodes: Record<string, string> = {
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Monaco: "MC",
    Germany: "DE",
    Belgium: "BE",
    Japan: "JP",
    Brazil: "BR",
    USA: "US",
    Canada: "CA",
    Australia: "AU",
    UK: "GB",
    Austria: "AT",
    Netherlands: "NL",
    Mexico: "MX",
    Switzerland: "CH",
    Hungary: "HU",
    Singapore: "SG",
    Russia: "RU",
    Sweden: "SE",
    Finland: "FI",
    Czechia: "CZ",
    China: "CN",
    Bahrain: "BH",
    "Saudi Arabia": "SA",
    Azerbaijan: "AZ",
    Qatar: "QA",
    Portugal: "PT",
    "South Africa": "ZA",
    "UAE": "AE",
  };

  const code = countryCodes[country];
  if (!code) return "🏁";

  // Convert country code (FR) to 🇫🇷
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}


export function nationalityToFlagEmoji(nationality: string): string {
  const map: Record<string, string> = {
    Dutch: '🇳🇱',
    British: '🇬🇧',
    Monegasque: '🇲🇨',
    Spanish: '🇪🇸',
    German: '🇩🇪',
    Finnish: '🇫🇮',
    French: '🇫🇷',
    Australian: '🇦🇺',
    Mexican: '🇲🇽',
    Canadian: '🇨🇦',
    Brazilian: '🇧🇷',
    Japanese: '🇯🇵',

  }

  return map[nationality] ?? ''
}
