import type { Http402DemoResponse } from "@/client/domain/http402/entity/http402_entity";
import type {
  Http402ProofHeader,
  Http402Repository,
} from "@/client/domain/http402/repository/http402_repository";
import type { Http402RemoteDataSource } from "../data_source/http402_remote_data_source";

export class Http402RepositoryImpl implements Http402Repository {
  public constructor(
    private readonly remoteDataSource: Http402RemoteDataSource
  ) {}

  public requestDemo(proof?: Http402ProofHeader): Promise<Http402DemoResponse> {
    return this.remoteDataSource.requestDemo(proof);
  }
}
