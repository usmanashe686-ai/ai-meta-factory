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

// ElectronBuilder handles building Electron projects into distributable executables.
type ElectronBuilder struct {
	// Working directory for builds
	WorkDir string
}

// BuildRequest contains parameters for building an Electron app.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Electron project
	ProjectZip []byte
	// AppName (used for output naming)
	AppName string
	// Platform target: "windows", "mac", "linux", or "all"
	Platform string
	// Arch: "x64", "arm64", etc.
	Arch string
	// Publish (whether to publish, optional)
	Publish bool
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

// NewElectronBuilder creates a new Electron builder with a working directory.
func NewElectronBuilder(workDir string) *ElectronBuilder {
	return &ElectronBuilder{WorkDir: workDir}
}

// Build runs the Electron build process.
func (b *ElectronBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "electron-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Electron app in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Run npm install (or yarn) to install dependencies
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

	// Determine electron-builder command based on platform
	var args []string
	if req.Platform == "all" {
		args = []string{"run", "dist", "--", "-mwl"}
	} else {
		args = []string{"run", "dist", "--", "--" + req.Platform}
	}
	if req.Arch != "" && req.Platform != "all" {
		args = append(args, "--arch", req.Arch)
	}

	// Run electron-builder via npm script (assumes "dist" script in package.json)
	cmd = exec.Command("npm", args...)
	cmd.Dir = tempDir
	stdout.Reset()
	stderr.Reset()
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running electron-builder with args: %v", args)
	err = cmd.Run()
	buildLog += "\n" + stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("electron-builder failed: %v", err),
		}, nil
	}

	// Find the output directory (usually dist/ or release/)
	// electron-builder typically outputs to dist/ by default, but can be configured.
	outDirs := []string{"dist", "release"}
	var artifactDir string
	for _, d := range outDirs {
		path := filepath.Join(tempDir, d)
		if info, err := os.Stat(path); err == nil && info.IsDir() {
			artifactDir = path
			break
		}
	}
	if artifactDir == "" {
		return nil, fmt.Errorf("could not find output directory (dist/ or release/)")
	}

	// Create a ZIP of the artifacts
	zipBuffer := new(bytes.Buffer)
	zipWriter := zip.NewWriter(zipBuffer)
	err = filepath.Walk(artifactDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		relPath, err := filepath.Rel(artifactDir, path)
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
