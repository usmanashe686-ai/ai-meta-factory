import { Octokit } from "octokit";

export interface GitHubConfig {
  accessToken: string;
  owner: string;
  repo: string;
  branch?: string;
}

export interface PushResult {
  success: boolean;
  url?: string;
  commitSha?: string;
  message?: string;
  error?: string;
}

export class GitHubService {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = { branch: 'main', ...config };
    this.octokit = new Octokit({ auth: config.accessToken });
  }

  async createRepository(): Promise<PushResult> {
    try {
      const { data: repo } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: this.config.repo,
        description: 'AI-generated project from Meta Factory',
        private: false,
        auto_init: false,
        gitignore_template: 'Node',
      });

      return {
        success: true,
        url: repo.html_url,
        message: `Repository created: ${repo.full_name}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create repository',
      };
    }
  }

  private async repositoryExists(): Promise<boolean> {
    try {
      await this.octokit.rest.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async createTree(
    files: Record<string, string>,
    baseTreeSha?: string
  ): Promise<{ success: boolean; treeSha?: string; error?: string }> {
    try {
      const tree = Object.entries(files).map(([path, content]) => ({
        path,
        mode: '100644' as const,
        type: 'blob' as const,
        content,
      }));

      const { data: createdTree } = await this.octokit.rest.git.createTree({
        owner: this.config.owner,
        repo: this.config.repo,
        tree,
        base_tree: baseTreeSha,
      });

      return { success: true, treeSha: createdTree.sha };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create tree' };
    }
  }

  async pushFiles(files: Record<string, string>): Promise<PushResult> {
    try {
      const repoExists = await this.repositoryExists();
      if (!repoExists) {
        const createResult = await this.createRepository();
        if (!createResult.success) return createResult;
      }

      // Get latest commit SHA
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
      });

      const latestCommitSha = ref.object.sha;

      // Create tree
      const tree = await this.createTree(files, latestCommitSha);
      if (!tree.success || !tree.treeSha) return { success: false, error: tree.error };

      // Create commit
      const { data: commit } = await this.octokit.rest.git.createCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        message: `Initial commit: AI-generated project ${new Date().toISOString()}`,
        tree: tree.treeSha,
        parents: [latestCommitSha],
      });

      // Update reference
      await this.octokit.rest.git.updateRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${this.config.branch}`,
        sha: commit.sha,
        force: false,
      });

      return {
        success: true,
        url: `https://github.com/${this.config.owner}/${this.config.repo}`,
        commitSha: commit.sha,
        message: `Successfully pushed ${Object.keys(files).length} files to GitHub`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to push files to GitHub',
      };
    }
  }

  async getUserInfo(): Promise<{ login: string; name?: string; avatar_url?: string } | null> {
    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      return {
        login: user.login,
        name: user.name ?? undefined,
        avatar_url: user.avatar_url ?? undefined,
      };
    } catch {
      return null;
    }
  }

  async getRepositories(): Promise<Array<{ name: string; full_name: string }>> {
    try {
      const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser();
      return repos.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
      }));
    } catch {
      return [];
    }
  }
}
