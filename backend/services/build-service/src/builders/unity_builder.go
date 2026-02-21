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

// UnityBuilder handles building Unity projects into platform-specific executables.
type UnityBuilder struct {
	// Working directory for builds
	WorkDir string
	// Path to Unity Editor executable (e.g., /Applications/Unity/Unity.app/Contents/MacOS/Unity)
	UnityPath string
}

// BuildRequest contains parameters for building a Unity app.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Unity project
	ProjectZip []byte
	// AppName (used for output naming)
	AppName string
	// Platform target: "windows", "mac", "linux", "android", "ios", "webgl"
	Platform string
	// BuildTarget (Unity build target string, e.g., "StandaloneWindows64")
	BuildTarget string
	// Additional build options (e.g., development build)
	Development bool
}

// BuildResponse contains the result of a build.
type BuildResponse struct {
	// ArtifactZip is a ZIP file containing all built artifacts
	ArtifactZip []byte
	// BuildLog contains the output from the build process
	BuildLog string
	// Error message if any
	Error string
}

// NewUnityBuilder creates a new Unity builder with a working directory.
func NewUnityBuilder(workDir, unityPath string) *UnityBuilder {
	return &UnityBuilder{WorkDir: workDir, UnityPath: unityPath}
}

// Build runs the Unity build process.
func (b *UnityBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "unity-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Unity project in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Determine output path
	outputDir := filepath.Join(tempDir, "build")
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output dir: %w", err)
	}

	// Map platform to Unity build target if not provided
	buildTarget := req.BuildTarget
	if buildTarget == "" {
		switch strings.ToLower(req.Platform) {
		case "windows":
			buildTarget = "StandaloneWindows64"
		case "mac":
			buildTarget = "StandaloneOSX"
		case "linux":
			buildTarget = "StandaloneLinux64"
		case "android":
			buildTarget = "Android"
		case "ios":
			buildTarget = "iOS"
		case "webgl":
			buildTarget = "WebGL"
		default:
			buildTarget = "StandaloneWindows64"
		}
	}

	// Build Unity command arguments
	args := []string{
		"-batchmode",
		"-nographics",
		"-projectPath", tempDir,
		"-executeMethod", "BuildScript.PerformBuild",
		"-logFile", filepath.Join(tempDir, "unity-build.log"),
		"-quit",
	}
	// Set custom arguments to pass to the build script (if any)
	args = append(args, "-buildTarget", buildTarget)
	args = append(args, "-outputPath", outputDir)
	if req.Development {
		args = append(args, "-development")
	}

	// Run Unity Editor
	cmd := exec.Command(b.UnityPath, args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running Unity build with target %s", buildTarget)
	err = cmd.Run()
	buildLog := stdout.String() + "\n" + stderr.String()

	// Also read the log file
	if logContent, err := ioutil.ReadFile(filepath.Join(tempDir, "unity-build.log")); err == nil {
		buildLog += "\n--- Unity Log ---\n" + string(logContent)
	}

	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("Unity build failed: %v", err),
		}, nil
	}

	// Create a ZIP of the build artifacts
	zipBuffer := new(bytes.Buffer)
	zipWriter := zip.NewWriter(zipBuffer)
	err = filepath.Walk(outputDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		relPath, err := filepath.Rel(outputDir, path)
		if err != nil {
			return err
		}
		fileContent, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}
		f, err := zipWriter.Create(relPath)
		if err != nil {
			return err
		}
		_, err = f.Write(fileContent)
		return err
	})
	if err != nil {
		return nil, fmt.Errorf("failed to zip artifacts: %w", err)
	}
	zipWriter.Close()

	return &BuildResponse{
		ArtifactZip: zipBuffer.Bytes(),
		BuildLog:    buildLog,
	}, nil
}
