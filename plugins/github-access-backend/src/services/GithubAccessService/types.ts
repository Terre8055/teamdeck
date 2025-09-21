import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export interface AccessRequest {
  id: string;
  githubIdentity: string;
  project: string;
  repoUrl: string;
  accessType: string;
  createdBy: string;
  createdAt: string;
}

export interface GithubAccessService {
  grantAccess(
    input: {
      githubIdentity: string;
      project: string;
      repoUrl: string;
      accessType: string;
    },
    options: {
      credentials: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<AccessRequest>;

  listRequests(): Promise<{ items: AccessRequest[] }>;
}
