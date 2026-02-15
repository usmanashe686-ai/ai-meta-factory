import axios from 'axios';

export interface GitHubExportOptions {
  token: string;
  repoName: string; // e.g., "username/repo" or just "repo" (will be created under user)
  description?: string;
  private?: boolean;
  files: Array<{ path: string; content: string }>; // base64-encoded content or raw string
  commitMessage?: string;
  branch?: string;
}

export class GitHubExporter {
  private baseUrl = 'https://api.github.com';

  /**
   * Create a repository and push files.
   */
  async exportToGitHub(options: GitHubExportOptions): Promise<{ repoUrl: string; defaultBranch: string }> {
    try {
      // Step 1: Create repository if it doesn't exist
      let repoFullName: string;
      if (options.repoName.includes('/')) {
        repoFullName = options.repoName;
      } else {
        // Get authenticated user to determine owner
        const user = await this.getAuthenticatedUser(options.token);
        repoFullName = `${user.login}/${options.repoName}`;
      }

      const repoExists = await this.repoExists(repoFullName, options.token);
      if (!repoExists) {
        await this.createRepo(options);
      }

      // Step 2: Get the default branch (usually main)
      const repoInfo = await this.getRepo(repoFullName, options.token);
      const defaultBranch = repoInfo.default_branch;

      // Step 3: Get the latest commit SHA on the branch (to create a new commit)
      const branchRef = await this.getBranchRef(repoFullName, defaultBranch, options.token);
      const baseTreeSha = branchRef.object.sha;

      // Step 4: Create a blob for each file and build a tree
      const treeItems = [];
      for (const file of options.files) {
        // Create blob
        const contentEncoded = Buffer.from(file.content).toString('base64');
        const blob = await this.createBlob(repoFullName, contentEncoded, options.token);
        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
      }

      // Step 5: Create a tree
      const tree = await this.createTree(repoFullName, treeItems, baseTreeSha, options.token);

      // Step 6: Create a commit
      const commitMessage = options.commitMessage || 'Initial commit via AI Meta Factory';
      const commit = await this.createCommit(
        repoFullName,
        commitMessage,
        tree.sha,
        [branchRef.object.sha],
        options.token
      );

      // Step 7: Update the branch reference
      await this.updateBranchRef(repoFullName, defaultBranch, commit.sha, options.token);

      return {
        repoUrl: repoInfo.html_url,
        defaultBranch,
      };
    } catch (error) {
      throw new Error(`GitHub export failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getAuthenticatedUser(token: string): Promise<{ login: string }> {
    const response = await axios.get(`${this.baseUrl}/user`, {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  }

  private async repoExists(repoFullName: string, token: string): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/repos/${repoFullName}`, {
        headers: { Authorization: `token ${token}` },
      });
      return true;
    } catch (error) {
      if (error.response?.status === 404) return false;
      throw error;
    }
  }

  private async createRepo(options: GitHubExportOptions): Promise<void> {
    const { token, repoName, description, private: isPrivate } = options;
    // If repoName contains slash, we assume it's full name and repo exists, but we checked.
    const name = repoName.includes('/') ? repoName.split('/')[1] : repoName;
    const response = await axios.post(
      `${this.baseUrl}/user/repos`,
      {
        name,
        description: description || '',
        private: isPrivate || false,
        auto_init: true, // initialize with README to have a default branch
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );
  }

  private async getRepo(repoFullName: string, token: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/repos/${repoFullName}`, {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  }

  private async getBranchRef(repoFullName: string, branch: string, token: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/repos/${repoFullName}/git/ref/heads/${branch}`, {
      headers: { Authorization: `token ${token}` },
    });
    return response.data;
  }

  private async createBlob(repoFullName: string, content: string, token: string): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${repoFullName}/git/blobs`,
      {
        content,
        encoding: 'base64',
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    return response.data;
  }

  private async createTree(
    repoFullName: string,
    treeItems: any[],
    baseTreeSha: string,
    token: string
  ): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${repoFullName}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeItems,
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    return response.data;
  }

  private async createCommit(
    repoFullName: string,
    message: string,
    treeSha: string,
    parents: string[],
    token: string
  ): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/repos/${repoFullName}/git/commits`,
      {
        message,
        tree: treeSha,
        parents,
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    return response.data;
  }

  private async updateBranchRef(
    repoFullName: string,
    branch: string,
    commitSha: string,
    token: string
  ): Promise<void> {
    await axios.patch(
      `${this.baseUrl}/repos/${repoFullName}/git/refs/heads/${branch}`,
      {
        sha: commitSha,
        force: false,
      },
      {
        headers: { Authorization: `token ${token}` },
      }
    );
  }
}
