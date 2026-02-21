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

// RaspberryPiBuilder handles building projects for Raspberry Pi.
type RaspberryPiBuilder struct {
	// Working directory for builds
	WorkDir string
	// Target architecture (armv6, armv7, arm64)
	Arch string
	// Cross-compilation toolchain path (optional)
	ToolchainPath string
}

// BuildRequest contains parameters for building a Raspberry Pi project.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the project
	ProjectZip []byte
	// ProjectType: "python", "node", "go", "rust", "c"
	ProjectType string
	// MainFile: entry point (e.g., main.py, main.go, etc.)
	MainFile string
	// OutputName: name of the output artifact
	OutputName string
	// Additional build arguments (e.g., compiler flags)
	BuildArgs []string
}

// BuildResponse contains the result of a build.
type BuildResponse struct {
	// ArtifactZip is a ZIP file containing all build artifacts
	ArtifactZip []byte
	// BuildLog contains the output from the build process
	BuildLog string
	// Error message if any
	Error string
}

// NewRaspberryPiBuilder creates a new Raspberry Pi builder.
func NewRaspberryPiBuilder(workDir, arch string) *RaspberryPiBuilder {
	return &RaspberryPiBuilder{
		WorkDir: workDir,
		Arch:    arch,
	}
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

// Build runs the Raspberry Pi build process.
func (b *RaspberryPiBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "rpi-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Raspberry Pi project in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Change to extracted directory
	buildDir := tempDir
	if req.MainFile != "" {
		buildDir = filepath.Dir(filepath.Join(tempDir, req.MainFile))
	}

	// Determine build command based on project type
	var cmd *exec.Cmd
	var outputDir string
	var buildLog strings.Builder

	switch strings.ToLower(req.ProjectType) {
	case "python":
		// Python projects just need to be packaged; no compilation needed.
		// We'll create a zip of the project (excluding unnecessary files).
		outputDir = filepath.Join(tempDir, "dist")
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create output dir: %w", err)
		}
		// Copy the entire project to outputDir (maybe filter .pyc, etc.)
		err = copyDir(tempDir, outputDir, []string{".pyc", "__pycache__"})
		if err != nil {
			return nil, fmt.Errorf("failed to copy project: %w", err)
		}
		buildLog.WriteString("Python project prepared for Raspberry Pi.\n")

	case "node":
		// Node.js: run npm install
		cmd = exec.Command("npm", "install")
		cmd.Dir = buildDir
		out, err := cmd.CombinedOutput()
		buildLog.Write(out)
		if err != nil {
			return &BuildResponse{
				BuildLog: buildLog.String(),
				Error:    fmt.Sprintf("npm install failed: %v", err),
			}, nil
		}
		// Package the node_modules and source into a zip
		outputDir = filepath.Join(tempDir, "dist")
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create output dir: %w", err)
		}
		err = copyDir(buildDir, outputDir, []string{"node_modules/.bin", "node_modules/.cache"})
		if err != nil {
			return nil, fmt.Errorf("failed to copy project: %w", err)
		}
		buildLog.WriteString("Node.js project prepared for Raspberry Pi.\n")

	case "go":
		// Go: cross-compile for target architecture
		env := os.Environ()
		env = append(env, "GOOS=linux", "GOARCH="+b.Arch)
		if b.Arch == "armv6" {
			env = append(env, "GOARM=6")
		} else if b.Arch == "armv7" {
			env = append(env, "GOARM=7")
		}
		outputName := req.OutputName
		if outputName == "" {
			outputName = "app"
		}
		outputPath := filepath.Join(tempDir, "dist", outputName)
		if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
			return nil, fmt.Errorf("failed to create output dir: %w", err)
		}
		args := []string{"build", "-o", outputPath}
		if req.MainFile != "" {
			args = append(args, req.MainFile)
		}
		cmd = exec.Command("go", args...)
		cmd.Dir = buildDir
		cmd.Env = env
		out, err := cmd.CombinedOutput()
		buildLog.Write(out)
		if err != nil {
			return &BuildResponse{
				BuildLog: buildLog.String(),
				Error:    fmt.Sprintf("go build failed: %v", err),
			}, nil
		}
		outputDir = filepath.Dir(outputPath)

	case "rust":
		// Rust: use cargo with target triple
		targetTriple := ""
		switch b.Arch {
		case "armv6":
			targetTriple = "arm-unknown-linux-gnueabihf"
		case "armv7":
			targetTriple = "armv7-unknown-linux-gnueabihf"
		case "arm64":
			targetTriple = "aarch64-unknown-linux-gnu"
		default:
			targetTriple = "armv7-unknown-linux-gnueabihf"
		}
		cmd = exec.Command("cargo", "build", "--release", "--target", targetTriple)
		cmd.Dir = buildDir
		out, err := cmd.CombinedOutput()
		buildLog.Write(out)
		if err != nil {
			return &BuildResponse{
				BuildLog: buildLog.String(),
				Error:    fmt.Sprintf("cargo build failed: %v", err),
			}, nil
		}
		// Locate binary (usually target/triple/release/...)
		binaryPath := filepath.Join(buildDir, "target", targetTriple, "release", req.OutputName)
		if _, err := os.Stat(binaryPath); err != nil {
			// Fallback: maybe the binary name is the project name
			projectName := filepath.Base(buildDir)
			binaryPath = filepath.Join(buildDir, "target", targetTriple, "release", projectName)
		}
		if _, err := os.Stat(binaryPath); err == nil {
			outputDir = filepath.Join(tempDir, "dist")
			if err := os.MkdirAll(outputDir, 0755); err != nil {
				return nil, fmt.Errorf("failed to create output dir: %w", err)
			}
			// Copy binary to output dir
			data, err := ioutil.ReadFile(binaryPath)
			if err != nil {
				return nil, err
			}
			outPath := filepath.Join(outputDir, filepath.Base(binaryPath))
			if err := ioutil.WriteFile(outPath, data, 0755); err != nil {
				return nil, err
			}
		} else {
			buildLog.WriteString("Could not locate built binary\n")
		}

	case "c", "cpp":
		// C/C++: use cross-compiler if toolchain provided, else use gcc/g++ with -march
		outputName := req.OutputName
		if outputName == "" {
			outputName = "app"
		}
		outputPath := filepath.Join(tempDir, "dist", outputName)
		if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
			return nil, fmt.Errorf("failed to create output dir: %w", err)
		}
		compiler := "gcc"
		if req.ProjectType == "cpp" {
			compiler = "g++"
		}
		archFlag := ""
		switch b.Arch {
		case "armv6":
			archFlag = "-march=armv6"
		case "armv7":
			archFlag = "-march=armv7-a"
		case "arm64":
			archFlag = "-march=armv8-a"
		}
		args := []string{archFlag, "-o", outputPath}
		if req.MainFile != "" {
			args = append(args, req.MainFile)
		} else {
			// compile all .c/.cpp files
			files, _ := filepath.Glob(filepath.Join(buildDir, "*.c"))
			if req.ProjectType == "cpp" {
				files, _ = filepath.Glob(filepath.Join(buildDir, "*.cpp"))
			}
			args = append(args, files...)
		}
		cmd = exec.Command(compiler, args...)
		cmd.Dir = buildDir
		out, err := cmd.CombinedOutput()
		buildLog.Write(out)
		if err != nil {
			return &BuildResponse{
				BuildLog: buildLog.String(),
				Error:    fmt.Sprintf("compilation failed: %v", err),
			}, nil
		}
		outputDir = filepath.Dir(outputPath)

	default:
		return nil, fmt.Errorf("unsupported project type: %s", req.ProjectType)
	}

	// If outputDir is set, zip its contents
	if outputDir != "" {
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
			BuildLog:    buildLog.String(),
		}, nil
	}

	// Fallback: return empty artifact
	return &BuildResponse{
		ArtifactZip: []byte{},
		BuildLog:    buildLog.String(),
	}, nil
}

// copyDir recursively copies a directory, skipping certain patterns.
func copyDir(src, dst string, skipPatterns []string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		// Check if any skip pattern matches
		for _, pattern := range skipPatterns {
			if strings.Contains(relPath, pattern) {
				return nil
			}
		}
		dstPath := filepath.Join(dst, relPath)
		if info.IsDir() {
			return os.MkdirAll(dstPath, info.Mode())
		}
		data, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}
		return ioutil.WriteFile(dstPath, data, info.Mode())
	})
}
