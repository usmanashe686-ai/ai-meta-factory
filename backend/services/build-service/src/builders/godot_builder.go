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

// GodotBuilder handles building Godot projects into platform-specific executables.
type GodotBuilder struct {
	// Working directory for builds
	WorkDir string
	// Path to Godot executable (e.g., /usr/bin/godot)
	GodotPath string
}

// BuildRequest contains parameters for building a Godot app.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Godot project
	ProjectZip []byte
	// AppName (used for output naming)
	AppName string
	// Platform target: "windows", "mac", "linux", "android", "ios", "web"
	Platform string
	// ExportPreset (name of the export preset defined in the project)
	ExportPreset string
	// Debug (build with debug symbols)
	Debug bool
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

// NewGodotBuilder creates a new Godot builder with a working directory.
func NewGodotBuilder(workDir, godotPath string) *GodotBuilder {
	return &GodotBuilder{WorkDir: workDir, GodotPath: godotPath}
}

// Build runs the Godot build process.
func (b *GodotBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "godot-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Godot project in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Determine export preset if not provided
	exportPreset := req.ExportPreset
	if exportPreset == "" {
		// Map platform to typical preset name
		switch strings.ToLower(req.Platform) {
		case "windows":
			exportPreset = "Windows Desktop"
		case "mac":
			exportPreset = "Mac OSX"
		case "linux":
			exportPreset = "Linux/X11"
		case "android":
			exportPreset = "Android"
		case "ios":
			exportPreset = "iOS"
		case "web":
			exportPreset = "HTML5"
		default:
			exportPreset = "Windows Desktop"
		}
	}

	// Determine output file name
	var outputExt string
	switch strings.ToLower(req.Platform) {
	case "windows":
		outputExt = ".exe"
	case "mac":
		outputExt = ".zip" // macOS exports as .zip or .dmg
	case "linux":
		outputExt = ".x86_64"
	case "android":
		outputExt = ".apk"
	case "ios":
		outputExt = ".ipa"
	case "web":
		outputExt = ".zip"
	default:
		outputExt = ".exe"
	}
	outputFile := filepath.Join(tempDir, "build", req.AppName+outputExt)
	if err := os.MkdirAll(filepath.Dir(outputFile), 0755); err != nil {
		return nil, fmt.Errorf("failed to create output dir: %w", err)
	}

	// Build Godot export command
	args := []string{
		"--path", tempDir,
		"--export",
	}
	if req.Debug {
		args = append(args, "--export-debug")
	}
	args = append(args, exportPreset, outputFile)

	cmd := exec.Command(b.GodotPath, args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running Godot export with preset %s", exportPreset)
	err = cmd.Run()
	buildLog := stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("Godot export failed: %v", err),
		}, nil
	}

	// If output is a directory (e.g., for web), we need to zip the whole directory.
	// For simplicity, we assume outputFile is the final artifact; if it's a directory, we'll zip it.
	// Check if outputFile is a directory.
	var artifactZip []byte
	if info, err := os.Stat(outputFile); err == nil && info.IsDir() {
		// Zip the directory
		zipBuffer := new(bytes.Buffer)
		zipWriter := zip.NewWriter(zipBuffer)
		err = filepath.Walk(outputFile, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if info.IsDir() {
				return nil
			}
			relPath, err := filepath.Rel(outputFile, path)
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
			return nil, fmt.Errorf("failed to zip output directory: %w", err)
		}
		zipWriter.Close()
		artifactZip = zipBuffer.Bytes()
	} else {
		// Read single file
		fileContent, err := ioutil.ReadFile(outputFile)
		if err != nil {
			return nil, fmt.Errorf("failed to read output file: %w", err)
		}
		zipBuffer := new(bytes.Buffer)
		zipWriter := zip.NewWriter(zipBuffer)
		f, err := zipWriter.Create(filepath.Base(outputFile))
		if err != nil {
			return nil, err
		}
		if _, err := f.Write(fileContent); err != nil {
			return nil, err
		}
		zipWriter.Close()
		artifactZip = zipBuffer.Bytes()
	}

	return &BuildResponse{
		ArtifactZip: artifactZip,
		BuildLog:    buildLog,
	}, nil
}
