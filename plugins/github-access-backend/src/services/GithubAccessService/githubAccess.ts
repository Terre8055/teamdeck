import { Router } from 'express';
import express from 'express';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

export async function createGithubAccessService(config: any): Promise<Router> {
  const router = Router();

  // Add JSON body parser middleware
  router.use(express.json());

  // Pull GitHub App creds from config
  const appConfig = config.getConfigArray('auth.providers.github.development.apps')[0];
  const appId = appConfig.getString('appId');
  const privateKey = appConfig.getString('privateKey');
  const installationId = config.getString('github.installationId');

  console.log('GitHub Access Service initialized with:', {
    appId: appId ? 'SET' : 'NOT SET',
    privateKey: privateKey ? 'SET' : 'NOT SET',
    installationId: installationId ? 'SET' : 'NOT SET'
  });

  router.post('/access', async (req, res) => {
    console.log('Received request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers
    });

    try {
      const { githubIdentity, repoUrl, accessType } = req.body;
      
      console.log('Parsed request body:', { githubIdentity, repoUrl, accessType });

      if (!githubIdentity || !repoUrl || !accessType) {
        throw new Error('Missing required fields: githubIdentity, repoUrl, or accessType');
      }

      const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          installationId,
        },
      });

      // Parse owner/repo from repoUrl
      const match = repoUrl.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
      if (!match) throw new Error('Invalid GitHub repo URL');
      const [_, owner, repo] = match;

      console.log('Parsed repo:', { owner, repo });

      // Check if the repository exists and we have access
      try {
        const repoInfo = await octokit.repos.get({ owner, repo });
        console.log('Repository found:', repoInfo.data?.full_name);
      } catch (repoError: any) {
        console.error('Repository access error:', repoError.message);
        if (repoError.status === 404) {
          throw new Error(`Repository ${owner}/${repo} not found or not accessible by the GitHub App`);
        }
        throw new Error(`Repository access error: ${repoError.message}`);
      }

      // Check if the user exists
      try {
        const userInfo = await octokit.users.getByUsername({ username: githubIdentity });
        console.log('User found:', userInfo.data?.login);
      } catch (userError: any) {
        console.error('User lookup error:', userError.message);
        if (userError.status === 404) {
          throw new Error(`GitHub user ${githubIdentity} not found`);
        }
        throw new Error(`User lookup error: ${userError.message}`);
      }

      // Check if user is already a collaborator and get their current permission
      let currentPermission = null;
      let isAlreadyCollaborator = false;
      try {
        const permissionInfo = await octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
          owner,
          repo,
          username: githubIdentity,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        
        console.log('Permission check response:', permissionInfo.data);
        
        if (permissionInfo.data) {
          isAlreadyCollaborator = true;
          currentPermission = permissionInfo.data.permission;
          console.log(`User ${githubIdentity} is already a collaborator with ${currentPermission} permission`);
        }
      } catch (permissionError: any) {
        if (permissionError.status === 404) {
          console.log(`User ${githubIdentity} is not yet a collaborator`);
          isAlreadyCollaborator = false;
        } else {
          console.error('Error checking collaborator permission:', permissionError.message);
          // Don't throw here, continue with the add request
        }
      }

      // Add/update the collaborator
      try {
        const result = await octokit.repos.addCollaborator({
          owner,
          repo,
          username: githubIdentity,
          permission: accessType as 'pull' | 'push' | 'admin',
        });
        
        console.log('Add collaborator response status:', result.status);
        
        // GitHub returns:
        // - 201 Created for new invitations (with response body containing invitation data)
        // - 204 No Content for existing collaborator updates (no response body)
        const isSuccess = result.status === 201 || result.status === 204;
        
        if (!isSuccess) {
          throw new Error(`Unexpected response status: ${result.status}`);
        }
        
        // Determine the appropriate message
        let message;
        let invitationUrl = null;
        
        if (result.status === 201 && result.data?.html_url) {
          // New invitation
          message = `Invitation sent to ${githubIdentity} for ${owner}/${repo}`;
          invitationUrl = result.data.html_url;
        } else if (result.status === 204) {
          // Existing collaborator update
          if (isAlreadyCollaborator && currentPermission) {
            message = `Permission updated for ${githubIdentity} on ${owner}/${repo} from ${currentPermission} to ${accessType}`;
          } else {
            message = `Access granted to ${githubIdentity} for ${owner}/${repo}`;
          }
        } else {
          // Fallback message
          message = `Access request processed for ${githubIdentity} on ${owner}/${repo}`;
        }
        
        console.log('Success response:', {
          message,
          invitationUrl,
          wasAlreadyCollaborator: isAlreadyCollaborator,
          previousPermission: currentPermission,
          statusCode: result.status
        });

        res.json({ 
          message,
          invitationUrl,
          wasAlreadyCollaborator: isAlreadyCollaborator,
          previousPermission: currentPermission
        });
      } catch (collabError: any) {
        console.error('Collaborator addition error:', collabError.message);
        if (collabError.status === 404) {
          throw new Error(`Cannot add collaborator to ${owner}/${repo}. Repository may not exist or app may not have admin access.`);
        }
        throw new Error(`Failed to add collaborator: ${collabError.message}`);
      }

    } catch (e: any) {
      console.error('Error in GitHub access endpoint:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}