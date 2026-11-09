import { CourierProvider } from "./types";
import { pathaoAdapter } from "./pathao";
import { steadfastAdapter } from "./steadfast";

export * from "./types";
export { pathaoAdapter, steadfastAdapter };

export function getCourierAdapter(providerName?: string): CourierProvider {
  const norm = (providerName || "").toUpperCase();
  if (norm.includes("STEADFAST")) {
    return steadfastAdapter;
  }
  // Default to Pathao
  return pathaoAdapter;
}
