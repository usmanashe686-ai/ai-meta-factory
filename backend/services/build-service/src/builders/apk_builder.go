package builders

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// ApkBuilder handles building Flutter projects into APK files.
type ApkBuilder struct {
	// Working directory for builds
	WorkDir string
}

// BuildRequest contains parameters for building an APK.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Flutter project
	ProjectZip []byte
	// AppName is the name of the app (optional)
	AppName string
	// PackageName is the Android package name (e.g., com.example.app)
	PackageName string
	// VersionCode (optional)
	VersionCode int
	// VersionName (optional)
	VersionName string
}

// BuildResponse contains the result of a build.
type BuildResponse struct {
	// ApkData is the built APK file content
	ApkData []byte
	// BuildLog contains the output from the build process
	BuildLog string
	// Error message if any
	Error string
}

// NewApkBuilder creates a new APK builder with a working directory.
func NewApkBuilder(workDir string) *ApkBuilder {
	return &ApkBuilder{WorkDir: workDir}
}

// Build runs the Flutter build process for the given project.
func (b *ApkBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "apkbuild-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir) // clean up after build

	log.Printf("Building APK in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Optionally modify pubspec.yaml to set package name, etc.
	if req.PackageName != "" {
		if err := updatePubspec(tempDir, req); err != nil {
			log.Printf("Warning: could not update pubspec: %v", err)
		}
	}

	// Run flutter build apk
	cmd := exec.Command("flutter", "build", "apk", "--release")
	cmd.Dir = tempDir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	log.Printf("Running flutter build apk in %s", tempDir)
	err = cmd.Run()
	buildLog := stdout.String() + "\n" + stderr.String()

	if err != nil {
		// Build failed
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("flutter build failed: %v", err),
		}, nil
	}

	// Locate the generated APK (typically build/app/outputs/flutter-apk/app-release.apk)
	apkPath := filepath.Join(tempDir, "build", "app", "outputs", "flutter-apk", "app-release.apk")
	apkData, err := ioutil.ReadFile(apkPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read APK file: %w", err)
	}

	return &BuildResponse{
		ApkData:  apkData,
		BuildLog: buildLog,
	}, nil
}

// unzipProject extracts a ZIP archive into the target directory.
func unzipProject(zipData []byte, targetDir string) error {
	reader := bytes.NewReader(zipData)
	zipReader, err := zip.NewReader(reader, int64(len(zipData)))
	if err != nil {
		return err
	}

	for _, file := range zipReader.File {
		path := filepath.Join(targetDir, file.Name)
		if file.FileInfo().IsDir() {
			os.MkdirAll(path, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(path), os.ModePerm); err != nil {
			return err
		}

		dstFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
		if err != nil {
			return err
		}

		srcFile, err := file.Open()
		if err != nil {
			dstFile.Close()
			return err
		}

		_, err = io.Copy(dstFile, srcFile)
		dstFile.Close()
		srcFile.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

// updatePubspec modifies pubspec.yaml to set app name and package name.
func updatePubspec(projectDir string, req *BuildRequest) error {
	pubspecPath := filepath.Join(projectDir, "pubspec.yaml")
	data, err := ioutil.ReadFile(pubspecPath)
	if err != nil {
		return err
	}

	lines := strings.Split(string(data), "\n")
	for i, line := range lines {
		if strings.HasPrefix(line, "name:") && req.AppName != "" {
			lines[i] = fmt.Sprintf("name: %s", req.AppName)
		}
		// Package name is set in android/app/build.gradle, not pubspec.
		// We'll handle package name separately if needed.
	}

	// Also update android/app/build.gradle for package name
	if req.PackageName != "" {
		gradlePath := filepath.Join(projectDir, "android", "app", "build.gradle")
		if _, err := os.Stat(gradlePath); err == nil {
			gradleData, err := ioutil.ReadFile(gradlePath)
			if err == nil {
				gradleStr := string(gradleData)
				// Replace applicationId line
				gradleStr = strings.ReplaceAll(gradleStr, `applicationId "`, `applicationId "`+req.PackageName)
				// This is simplistic; proper parsing would be better.
				ioutil.WriteFile(gradlePath, []byte(gradleStr), 0644)
			}
		}
	}

	return ioutil.WriteFile(pubspecPath, []byte(strings.Join(lines, "\n")), 0644)
}
