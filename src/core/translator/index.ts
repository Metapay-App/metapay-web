import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  type MetaPayDictionary,
} from "./types";
import { idDictionary } from "./dictionaries/id";
import { enDictionary } from "./dictionaries/en";
import { zhDictionary } from "./dictionaries/zh";

const DICTIONARIES: Record<Locale, MetaPayDictionary> = {
  id: idDictionary,
  en: enDictionary,
  zh: zhDictionary,
};

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value?: string): Locale {
  if (value && isSupportedLocale(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}

export function getDictionary(locale?: string): MetaPayDictionary {
  return DICTIONARIES[resolveLocale(locale)];
}

export type { Locale, MetaPayDictionary };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
