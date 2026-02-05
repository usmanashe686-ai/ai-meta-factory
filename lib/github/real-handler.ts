import { Octokit } from '@octokit/rest';

export interface GitHubPushOptions {
  owner: string;
  repo: string;
  branch?: string;
  commitMessage: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  createRepo?: boolean;
  isPrivate?: boolean;
}

export class RealGitHubHandler {
  private octokit: Octokit;

  constructor(token: string) {
    if (!token) {
      throw new Error('GitHub token is required');
    }

    this.octokit = new Octokit({
      auth: token,
      userAgent: 'AI Meta Factory',
    });
  }

  async pushToGitHub(options: GitHubPushOptions): Promise<{
    success: boolean;
    repoUrl?: string;
    commitHash?: string;
    error?: string;
    filesPushed?: number;
  }> {
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

      // 2. Get or create branch
      let currentCommitSha = await this.getBranchSha(owner, repo, branch);
      
      if (!currentCommitSha) {
        const defaultBranch = await this.getDefaultBranch(owner, repo);
        currentCommitSha = await this.createBranch(owner, repo, branch, defaultBranch);
      }

      // 3. Get the current tree SHA
      const commit = await this.octokit.git.getCommit({
        owner,
        repo,
        commit_sha: currentCommitSha
      });

      const treeSha = commit.data.tree.sha;

      // 4. Create blobs for all files
      const blobs = await Promise.all(
        files.map(async (file) => {
          const blob = await this.octokit.git.createBlob({
            owner,
            repo,
            content: file.content,
            encoding: 'utf-8'
          });
          return {
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.data.sha
          };
        })
      );

      // 5. Create a new tree
      const tree = await this.octokit.git.createTree({
        owner,
        repo,
        base_tree: treeSha,
        tree: blobs
      });

      // 6. Create a new commit
      const newCommit = await this.octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: tree.data.sha,
        parents: [currentCommitSha]
      });

      // 7. Update the branch reference
      await this.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.data.sha
      });

      return {
        success: true,
        repoUrl: `https://github.com/${owner}/${repo}`,
        commitHash: newCommit.data.sha,
        filesPushed: files.length
      };

    } catch (error: any) {
      console.error('[GitHub] Push failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to push to GitHub'
      };
    }
  }

  private async createRepository(owner: string, name: string, isPrivate: boolean): Promise<void> {
    try {
      // Check if repo exists
      await this.octokit.repos.get({ owner, repo: name });
      return; // Repository exists
    } catch (error: any) {
      if (error.status === 404) {
        // Create new repository
        if (owner === (await this.getAuthenticatedUser()).login) {
          await this.octokit.repos.createForAuthenticatedUser({
            name,
            private: isPrivate,
            auto_init: false,
            description: 'Created by AI Meta Factory'
          });
        } else {
          await this.octokit.repos.createInOrg({
            org: owner,
            name,
            private: isPrivate
          });
        }
      } else {
        throw error;
      }
    }
  }

  private async getAuthenticatedUser() {
    const response = await this.octokit.users.getAuthenticated();
    return response.data;
  }

  private async getBranchSha(owner: string, repo: string, branch: string): Promise<string | null> {
    try {
      const response = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      return response.data.object.sha;
    } catch {
      return null;
    }
  }

  private async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const response = await this.octokit.repos.get({ owner, repo });
    return response.data.default_branch;
  }

  private async createBranch(owner: string, repo: string, branch: string, sourceBranch: string): Promise<string> {
    const sourceRef = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${sourceBranch}`
    });

    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: sourceRef.data.object.sha
    });

    return sourceRef.data.object.sha;
  }
}
