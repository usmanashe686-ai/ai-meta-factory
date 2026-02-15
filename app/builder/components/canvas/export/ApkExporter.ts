export interface ApkBuildOptions {
  projectId: string;
  appName: string;
  packageName: string;
  version: string;
  icon?: File;
  splash?: File;
}

export interface BuildStatus {
  status: 'pending' | 'building' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
}

export class ApkExporter {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/export/apk') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Request APK build from the backend.
   */
  async requestBuild(options: ApkBuildOptions): Promise<{ buildId: string }> {
    const formData = new FormData();
    formData.append('projectId', options.projectId);
    formData.append('appName', options.appName);
    formData.append('packageName', options.packageName);
    formData.append('version', options.version);
    if (options.icon) formData.append('icon', options.icon);
    if (options.splash) formData.append('splash', options.splash);

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Build request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Poll build status.
   */
  async getBuildStatus(buildId: string): Promise<BuildStatus> {
    const response = await fetch(`${this.apiEndpoint}/${buildId}/status`);
    if (!response.ok) {
      throw new Error(`Failed to get build status: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Download the built APK.
   */
  async downloadApk(buildId: string): Promise<Blob> {
    const response = await fetch(`${this.apiEndpoint}/${buildId}/download`);
    if (!response.ok) {
      throw new Error(`Failed to download APK: ${response.statusText}`);
    }
    return await response.blob();
  }
}
