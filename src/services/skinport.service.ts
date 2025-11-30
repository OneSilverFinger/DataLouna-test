import { ItemPrice } from '../types/items';
import { SkinportItem } from '../types/skinport';
import { getCache, setCache } from './cache.service';

const DEFAULT_APP_ID = '730';
const DEFAULT_CURRENCY = 'EUR';
const CACHE_KEY = `skinport:items:${DEFAULT_APP_ID}:${DEFAULT_CURRENCY}`;
const CACHE_TTL_SECONDS = 60;

const baseUrl = process.env.SKINPORT_BASE_URL ?? 'https://api.skinport.com/v1';

async function fetchSkinportItems(tradable: boolean): Promise<SkinportItem[]> {
  const params = new URLSearchParams({
    app_id: DEFAULT_APP_ID,
    currency: DEFAULT_CURRENCY,
    tradable: tradable ? '1' : '0',
  });

  const response = await fetch(`${baseUrl}/items?${params.toString()}`, {
    headers: {
      'Accept-Encoding': 'br',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Skinport fetch failed: ${response.status} ${response.statusText} ${text}`);
  }

  const data = (await response.json()) as SkinportItem[];
  return data;
}

function mergeItems(
  tradableItems: SkinportItem[],
  nonTradableItems: SkinportItem[]
): ItemPrice[] {
  const merged = new Map<
    string,
    { minPriceTradable: number | null; minPriceNonTradable: number | null }
  >();

  for (const item of tradableItems) {
    merged.set(item.market_hash_name, {
      minPriceTradable: item.min_price,
      minPriceNonTradable: merged.get(item.market_hash_name)?.minPriceNonTradable ?? null,
    });
  }

  for (const item of nonTradableItems) {
    merged.set(item.market_hash_name, {
      minPriceTradable: merged.get(item.market_hash_name)?.minPriceTradable ?? null,
      minPriceNonTradable: item.min_price,
    });
  }

  return Array.from(merged.entries()).map(([marketHashName, prices]) => ({
    marketHashName,
    minPriceTradable: prices.minPriceTradable,
    minPriceNonTradable: prices.minPriceNonTradable,
  }));
}

export async function fetchItemsWithMinPrices(): Promise<ItemPrice[]> {
  const cached = await getCache<ItemPrice[]>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const [tradable, nonTradable] = await Promise.all([
    fetchSkinportItems(true),
    fetchSkinportItems(false),
  ]);

  const result = mergeItems(tradable, nonTradable);

  await setCache(CACHE_KEY, result, CACHE_TTL_SECONDS);

  return result;
}
