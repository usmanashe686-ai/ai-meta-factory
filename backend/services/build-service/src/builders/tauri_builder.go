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
)

// TauriBuilder handles building Tauri projects into distributable executables.
type TauriBuilder struct {
	// Working directory for builds
	WorkDir string
}

// BuildRequest contains parameters for building a Tauri app.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Tauri project
	ProjectZip []byte
	// AppName (used for output naming)
	AppName string
	// Platform target: "windows", "mac", "linux"
	Platform string
	// Arch: "x64", "arm64", etc.
	Arch string
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

// NewTauriBuilder creates a new Tauri builder with a working directory.
func NewTauriBuilder(workDir string) *TauriBuilder {
	return &TauriBuilder{WorkDir: workDir}
}

// Build runs the Tauri build process.
func (b *TauriBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "tauri-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Tauri app in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Run npm install (or yarn) to install frontend dependencies
	cmd := exec.Command("npm", "install")
	cmd.Dir = tempDir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running npm install")
	err = cmd.Run()
	buildLog := stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("npm install failed: %v", err),
		}, nil
	}

	// Run tauri build
	args := []string{"run", "tauri", "build", "--", "--target", req.Platform}
	if req.Arch != "" {
		args = append(args, "--arch", req.Arch)
	}
	cmd = exec.Command("npm", args...)
	cmd.Dir = tempDir
	stdout.Reset()
	stderr.Reset()
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running tauri build")
	err = cmd.Run()
	buildLog += "\n" + stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("tauri build failed: %v", err),
		}, nil
	}

	// Find the output directory (usually src-tauri/target/release/bundle/)
	// Tauri places bundles in src-tauri/target/release/bundle/
	bundleDir := filepath.Join(tempDir, "src-tauri", "target", "release", "bundle")
	if _, err := os.Stat(bundleDir); os.IsNotExist(err) {
		// Fallback: maybe in target/release/bundle (older versions)
		bundleDir = filepath.Join(tempDir, "target", "release", "bundle")
	}
	if _, err := os.Stat(bundleDir); os.IsNotExist(err) {
		return nil, fmt.Errorf("could not find bundle directory")
	}

	// Create a ZIP of the bundle contents (all platforms)
	zipBuffer := new(bytes.Buffer)
	zipWriter := zip.NewWriter(zipBuffer)
	err = filepath.Walk(bundleDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		relPath, err := filepath.Rel(bundleDir, path)
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
