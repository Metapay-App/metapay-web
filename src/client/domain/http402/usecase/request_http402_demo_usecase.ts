import type { Http402DemoResponse } from "../entity/http402_entity";
import type {
  Http402ProofHeader,
  Http402Repository,
} from "../repository/http402_repository";

export class RequestHttp402DemoUseCase {
  public constructor(private readonly repository: Http402Repository) {}

  public execute(proof?: Http402ProofHeader): Promise<Http402DemoResponse> {
    return this.repository.requestDemo(proof);
  }
}
