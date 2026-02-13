package builders

import (
    "os/exec"
    "path/filepath"
)

type FlutterBuilder struct {
    ProjectDir string
    BuildID    string
}

func (fb *FlutterBuilder) BuildAPK() (string, error) {
    cmd := exec.Command("flutter", "build", "apk", "--release")
    cmd.Dir = fb.ProjectDir
    if err := cmd.Run(); err != nil {
        return "", err
    }
    apkPath := filepath.Join(fb.ProjectDir, "build", "app", "outputs", "flutter-apk", "app-release.apk")
    return apkPath, nil
}

func (fb *FlutterBuilder) BuildIOS() (string, error) {
    cmd := exec.Command("flutter", "build", "ios", "--release")
    cmd.Dir = fb.ProjectDir
    if err := cmd.Run(); err != nil {
        return "", err
    }
    return filepath.Join(fb.ProjectDir, "build", "ios", "iphoneos", "Runner.app"), nil
}
