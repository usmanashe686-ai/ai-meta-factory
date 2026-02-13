package builders

import (
	"os/exec"
	"path/filepath"
)

// ReactNativeBuilder handles building React Native projects
type ReactNativeBuilder struct {
	ProjectDir string
	BuildID    string
}

// BuildAPK builds a release APK for Android
// It runs the gradle assembleRelease task inside the android folder
func (rn *ReactNativeBuilder) BuildAPK() (string, error) {
	// Navigate to android directory and run gradle wrapper
	androidDir := filepath.Join(rn.ProjectDir, "android")
	cmd := exec.Command("./gradlew", "assembleRelease")
	cmd.Dir = androidDir

	if err := cmd.Run(); err != nil {
		return "", err
	}

	// Path to generated APK (typical location)
	apkPath := filepath.Join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk")
	return apkPath, nil
}

// BuildBundle builds an Android App Bundle (AAB)
func (rn *ReactNativeBuilder) BuildBundle() (string, error) {
	androidDir := filepath.Join(rn.ProjectDir, "android")
	cmd := exec.Command("./gradlew", "bundleRelease")
	cmd.Dir = androidDir

	if err := cmd.Run(); err != nil {
		return "", err
	}

	aabPath := filepath.Join(androidDir, "app", "build", "outputs", "bundle", "release", "app-release.aab")
	return aabPath, nil
}

// BuildIOS would be implemented here if running on macOS
// For now, we leave it as a stub
func (rn *ReactNativeBuilder) BuildIOS() (string, error) {
	// iOS builds require Xcode and are only possible on macOS
	return "", nil
}
