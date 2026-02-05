import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';

interface RealPushOptions {
  owner: string;
  repo: string;
  branch?: string;
  commitMessage: string;
  files: Array<{
    path: string;
    content: string;
    mode?: '100644' | '100755' | '040000' | '160000' | '120000';
  }>;
  createRepo?: boolean;
  isPrivate?: boolean;
}

export class RealGitHubPushHandler {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async pushToGitHub(options: RealPushOptions): Promise<GitHubPushResult> {
    try {
      const {
        owner,
        repo,
        branch = 'main',
        commitMessage,
        files,
        createRepo = true,
        isPrivate = false
      } = options;

      // 1. Create repository if it doesn't exist
      if (createRepo) {
        await this.createRepository(owner, repo, isPrivate);
      }

      // 2. Get the current commit SHA
      const ref = await this.octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
        owner,
        repo,
        ref: `heads/${branch}`
      }).catch(async () => {
        // If branch doesn't exist, create it from the default branch
        const defaultBranch = await this.getDefaultBranch(owner, repo);
        return this.createBranch(owner, repo, branch, defaultBranch);
      });

      const latestCommitSha = ref.data.object.sha;

      // 3. Get the tree SHA
      const commit = await this.octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
        owner,
        repo,
        commit_sha: latestCommitSha
      });

      const treeSha = commit.data.tree.sha;

      // 4. Create blobs for all files
      const blobs = await Promise.all(
        files.map(async (file) => {
          const blob = await this.octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
            owner,
            repo,
            content: file.content,
            encoding: 'utf-8'
          });
          return {
            path: file.path,
            mode: file.mode || '100644',
            type: 'blob',
            sha: blob.data.sha
          };
        })
      );

      // 5. Create a new tree
      const tree = await this.octokit.request('POST /repos/{owner}/{repo}/git/trees', {
        owner,
        repo,
        base_tree: treeSha,
        tree: blobs
      });

      // 6. Create a new commit
      const newCommit = await this.octokit.request('POST /repos/{owner}/{repo}/git/commits', {
        owner,
        repo,
        message: commitMessage,
        tree: tree.data.sha,
        parents: [latestCommitSha]
      });

      // 7. Update the branch reference
      await this.octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.data.sha
      });

      return {
        success: true,
        repoUrl: `https://github.com/${owner}/${repo}`,
        commitHash: newCommit.data.sha,
        filesPushed: files.length,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.data.sha}`
      };

    } catch (error: any) {
      console.error('Real GitHub push failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to push to GitHub',
        errorDetails: error.response?.data
      };
    }
  }

  private async createRepository(owner: string, name: string, isPrivate: boolean): Promise<void> {
    try {
      if (owner === this.getAuthenticatedUser()?.login) {
        // Create user repository
        await this.octokit.request('POST /user/repos', {
          name,
          private: isPrivate,
          auto_init: false,
          description: 'Created by AI Meta Factory'
        });
      } else {
        // Create organization repository
        await this.octokit.request('POST /orgs/{org}/repos', {
          org: owner,
          name,
          private: isPrivate,
          auto_init: false
        });
      }
    } catch (error: any) {
      if (error.status !== 422) { // 422 means repo already exists
        throw error;
      }
    }
  }

  private async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const repoInfo = await this.octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo
    });
    return repoInfo.data.default_branch;
  }

  private async createBranch(owner: string, repo: string, branch: string, sourceBranch: string): Promise<any> {
    const ref = await this.octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      owner,
      repo,
      ref: `heads/${sourceBranch}`
    });

    return this.octokit.request('POST /repos/{owner}/{repo}/git/refs', {
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: ref.data.object.sha
    });
  }

  private getAuthenticatedUser(): any {
    // Get authenticated user info
    // This would need to be implemented with proper auth flow
    return null;
  }

  // Real method to check if repo exists
  async repositoryExists(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo
      });
      return true;
    } catch {
      return false;
    }
  }

  // Real method to get user's repositories
  async getUserRepositories(): Promise<any[]> {
    const response = await this.octokit.request('GET /user/repos', {
      per_page: 100,
      sort: 'updated'
    });
    return response.data;
  }
}
