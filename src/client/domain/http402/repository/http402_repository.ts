import type { Http402DemoResponse } from "../entity/http402_entity";

export interface Http402ProofHeader {
  refId: string;
  txHash: string;
}

export interface Http402Repository {
  requestDemo(proof?: Http402ProofHeader): Promise<Http402DemoResponse>;
}
