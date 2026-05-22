/**
 * RxNav / RxNorm client — free NIH API, no key required.
 * Handles drug-drug interaction lookups via RxCUI resolution.
 */

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";
const INTERACTION_BASE = "https://rxnav.nlm.nih.gov/REST/interaction";

async function getRxCui(drugName: string): Promise<string | null> {
  try {
    const url = `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.idGroup?.rxnormId?.[0];
    return id ?? null;
  } catch {
    return null;
  }
}

export interface RxNavInteraction {
  drug1: string;
  drug2: string;
  severity: string;
  description: string;
}

export async function checkDrugDrugInteractions(
  drugNames: string[]
): Promise<RxNavInteraction[]> {
  if (drugNames.length < 2) return [];

  // Resolve all RxCUIs in parallel
  const cuiPairs = await Promise.all(
    drugNames.map(async (name) => ({ name, cui: await getRxCui(name) }))
  );

  const resolved = cuiPairs.filter((d) => d.cui !== null);
  if (resolved.length < 2) return [];

  const cuiList = resolved.map((d) => d.cui).join("+");
  const url = `${INTERACTION_BASE}/list.json?rxcuis=${cuiList}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    const interactions: RxNavInteraction[] = [];
    const groups = data?.fullInteractionTypeGroup ?? [];

    for (const group of groups) {
      for (const interType of group.fullInteractionType ?? []) {
        const drug1 =
          interType.minConcept?.[0]?.name ?? "Unknown";
        const drug2 =
          interType.minConcept?.[1]?.name ?? "Unknown";
        const pairs = interType.interactionPair ?? [];
        for (const pair of pairs) {
          interactions.push({
            drug1,
            drug2,
            severity: pair.severity ?? "unknown",
            description: pair.description ?? "",
          });
        }
      }
    }

    return interactions;
  } catch {
    return [];
  }
}
