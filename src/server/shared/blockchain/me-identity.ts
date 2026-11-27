import { normalizeToEvmAndMe } from "@/core/utils/address";
import { BadRequestError } from "../errors/app-error";

export interface MeIdentityInfo {
  evmAddress: string;
  meAddress: string;
  hasMeId: boolean;
  meId: string | null;
  regionId: string | null;
  isSubAccount: boolean;
}

interface MeDidApiResponse {
  did?: string;
  did_info?: {
    did?: string;
    region_id?: string;
    regionId?: string;
  };
  info?: {
    did?: string;
    region_id?: string;
    regionId?: string;
  };
  region_id?: string;
}

function getHubRestUrl(): string {
  return process.env.ME_HUB_REST_URL || "http://118.175.0.249:1317";
}

async function fetchJsonSafe(url: string): Promise<MeDidApiResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      return data as MeDidApiResponse;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractDidFields(data: MeDidApiResponse | null): {
  did: string | null;
  regionId: string | null;
} {
  if (!data) return { did: null, regionId: null };
  const did =
    data.did ?? data.did_info?.did ?? data.info?.did ?? null;
  const regionId =
    data.region_id ??
    data.did_info?.region_id ??
    data.did_info?.regionId ??
    data.info?.region_id ??
    data.info?.regionId ??
    null;
  return {
    did: did && did.trim().length > 0 ? did.trim() : null,
    regionId: regionId && regionId.trim().length > 0 ? regionId.trim() : null,
  };
}

export async function lookupMeIdentity(address: string): Promise<MeIdentityInfo> {
  let pair;
  try {
    pair = normalizeToEvmAndMe(address);
  } catch (err) {
    throw new BadRequestError(
      err instanceof Error ? err.message : "Invalid address format",
      "INVALID_ADDRESS"
    );
  }

  const baseUrl = getHubRestUrl().replace(/\/+$/, "");

  const mainRes = await fetchJsonSafe(
    `${baseUrl}/metaearth/did/did?address=${encodeURIComponent(pair.meAddress)}`
  );
  const mainDid = extractDidFields(mainRes);
  if (mainDid.did) {
    return {
      evmAddress: pair.evmAddress,
      meAddress: pair.meAddress,
      hasMeId: true,
      meId: mainDid.did,
      regionId: mainDid.regionId,
      isSubAccount: false,
    };
  }

  const subRes = await fetchJsonSafe(
    `${baseUrl}/metaearth/kyc/QuerySubAccountDidResponse?sub_account=${encodeURIComponent(
      pair.meAddress
    )}`
  );
  const subDid = extractDidFields(subRes);
  if (subDid.did) {
    return {
      evmAddress: pair.evmAddress,
      meAddress: pair.meAddress,
      hasMeId: true,
      meId: subDid.did,
      regionId: subDid.regionId,
      isSubAccount: true,
    };
  }

  return {
    evmAddress: pair.evmAddress,
    meAddress: pair.meAddress,
    hasMeId: false,
    meId: null,
    regionId: null,
    isSubAccount: false,
  };
}
