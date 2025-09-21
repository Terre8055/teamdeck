import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createGithubAccessService } from './services/GithubAccessService';

/**
 * githubAccessPlugin backend plugin
 *
 * @public
 */
export const githubAccessPlugin = createBackendPlugin({
  pluginId: 'github-access',
  register(env) {
    env.registerInit({
      deps: {
        // logger: coreServices.logger,
        // httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, config }) {
        const githubAccessRouter = await createGithubAccessService(config);
        
        // Use the router directly
        httpRouter.use(githubAccessRouter);
      },
    });
  },
});