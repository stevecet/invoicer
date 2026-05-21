import { api } from "@/src/services/api";

export type Currency = {
  _id: string;
  code: string;
  name: string;
  symbol: string;
};

const FALLBACK_CURRENCIES: Currency[] = [
  { _id: "usd", code: "USD", name: "United States Dollar", symbol: "$" },
  { _id: "eur", code: "EUR", name: "Euro", symbol: "€" },
  { _id: "gbp", code: "GBP", name: "British Pound", symbol: "£" },
  { _id: "cad", code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { _id: "aud", code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { _id: "jpy", code: "JPY", name: "Japanese Yen", symbol: "¥" },
];

export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await api.get<any>("/currencies");
    
    let rawList: any = null;
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data && Array.isArray(response.data.currencies)) {
      rawList = response.data.currencies;
    } else if (response.data && Array.isArray(response.data.data)) {
      rawList = response.data.data;
    }

    if (rawList && rawList.length > 0) {
      return rawList.map((item: any) => ({
        _id: item._id || item.id || item.code.toLowerCase(),
        code: item.code,
        name: item.name,
        symbol: item.symbol,
      }));
    }
  } catch (error) {
    console.warn("Backend currencies endpoint failed, using rich local fallbacks:", error);
  }

  return FALLBACK_CURRENCIES;
}
