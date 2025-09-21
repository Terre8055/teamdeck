import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  createApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

// Define the GitHub Access API interface
export interface GithubAccessApi {
  grantAccess(request: {
    githubIdentity: string;
    project: string;
    repoUrl: string;
    accessType: string;
  }): Promise<{ message: string }>;
  
  listRequests(): Promise<{ items: any[] }>;
}

// Create the API reference
export const githubAccessApiRef = createApiRef<GithubAccessApi>({
  id: 'plugin.github-access.service',
});

// Create the API factory
export const githubAccessApiFactory = createApiFactory({
  api: githubAccessApiRef,
  deps: { configApi: configApiRef, fetchApi: fetchApiRef },
  factory: ({ configApi, fetchApi }) => {
    const backendUrl = configApi.getString('backend.baseUrl');
    
    return {
      async grantAccess(request) {
        const response = await fetchApi.fetch(`${backendUrl}/api/github-access/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to grant access');
        }

        return response.json();
      },

      async listRequests() {
        const response = await fetchApi.fetch(`${backendUrl}/api/github-access/access`);
        
        if (!response.ok) {
          throw new Error('Failed to list requests');
        }

        return response.json();
      },
    };
  },
});

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  githubAccessApiFactory,
];