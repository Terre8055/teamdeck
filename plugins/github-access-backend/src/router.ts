import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import { Router } from 'express';
import { GithubAccessService } from './services/GithubAccessService/types';

export async function createRouter({
  httpAuth,
  githubAccessService,
}: {
  httpAuth: HttpAuthService;
  githubAccessService: GithubAccessService;
}): Promise<import('express').IRouter> {
  const router = Router();
  router.use(require('express').json());

  const accessSchema = z.object({
    githubIdentity: z.string(),
    project: z.string(),
    repoUrl: z.string(),
    accessType: z.enum(['read', 'write', 'admin']),
  });

  router.post('/access', async (req, res) => {
    const parsed = accessSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const result = await githubAccessService.grantAccess(parsed.data, {
      credentials: await httpAuth.credentials(req, { allow: ['user'] }),
    });

    res.status(201).json(result);
  });

  router.get('/access', async (_req, res) => {
    res.json(await githubAccessService.listRequests());
  });

  return router;
}
