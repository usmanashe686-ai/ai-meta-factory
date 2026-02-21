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

// ArduinoBuilder handles building Arduino sketches into hex/bin files.
type ArduinoBuilder struct {
	// Working directory for builds
	WorkDir string
	// Path to arduino-cli executable (or Arduino IDE)
	CliPath string
	// FQBN (Fully Qualified Board Name), e.g., "arduino:avr:uno"
	FQBN string
}

// BuildRequest contains parameters for building an Arduino sketch.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the Arduino sketch folder
	ProjectZip []byte
	// SketchName (the .ino file name without extension)
	SketchName string
	// BoardFQBN overrides the builder's default FQBN if provided
	BoardFQBN string
	// Additional libraries to install (list of library names)
	Libraries []string
	// UploadPort (optional) – if provided, also upload after build
	UploadPort string
}

// BuildResponse contains the result of a build.
type BuildResponse struct {
	// BinaryData is the compiled firmware (hex/bin)
	BinaryData []byte
	// BuildLog contains the output from the build process
	BuildLog string
	// Error message if any
	Error string
}

// NewArduinoBuilder creates a new Arduino builder with a working directory.
func NewArduinoBuilder(workDir, cliPath, fqbn string) *ArduinoBuilder {
	return &ArduinoBuilder{
		WorkDir: workDir,
		CliPath: cliPath,
		FQBN:    fqbn,
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

// Build runs the Arduino build process.
func (b *ArduinoBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "arduino-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	log.Printf("Building Arduino sketch in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Determine the sketch file (.ino) – should be in the root or a subfolder
	var sketchPath string
	err = filepath.Walk(tempDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".ino") {
			sketchPath = path
			return filepath.SkipAll
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("error walking project: %w", err)
	}
	if sketchPath == "" {
		return nil, fmt.Errorf("no .ino sketch file found in project")
	}

	// Determine FQBN to use
	fqbn := b.FQBN
	if req.BoardFQBN != "" {
		fqbn = req.BoardFQBN
	}
	if fqbn == "" {
		return nil, fmt.Errorf("no board FQBN specified")
	}

	// Install required libraries (if any)
	var buildLog strings.Builder
	if len(req.Libraries) > 0 {
		for _, lib := range req.Libraries {
			cmd := exec.Command(b.CliPath, "lib", "install", lib)
			cmd.Dir = tempDir
			out, err := cmd.CombinedOutput()
			buildLog.WriteString(fmt.Sprintf("Installing library %s:\n%s\n", lib, out))
			if err != nil {
				buildLog.WriteString(fmt.Sprintf("Failed to install library %s: %v\n", lib, err))
			}
		}
	}

	// Run arduino-cli compile
	args := []string{"compile", "--fqbn", fqbn, "--output-dir", tempDir}
	// If sketchPath is not in the root, we need to pass the sketch directory?
	// arduino-cli compile accepts a sketch path (directory containing .ino)
	sketchDir := filepath.Dir(sketchPath)
	args = append(args, sketchDir)

	cmd := exec.Command(b.CliPath, args...)
	cmd.Dir = tempDir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running arduino-cli compile with FQBN %s", fqbn)
	err = cmd.Run()
	buildLog.WriteString(stdout.String())
	buildLog.WriteString(stderr.String())
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog.String(),
			Error:    fmt.Sprintf("compile failed: %v", err),
		}, nil
	}

	// Locate the compiled binary (usually sketch_name.ino.hex or .bin)
	// arduino-cli places it in the output directory with name like "sketch.ino.hex"
	// We'll search for the largest .hex or .bin file in tempDir
	var binaryPath string
	err = filepath.Walk(tempDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			if ext == ".hex" || ext == ".bin" || ext == ".elf" {
				// Prefer .hex or .bin over .elf
				if binaryPath == "" || ext == ".hex" || ext == ".bin" {
					binaryPath = path
				}
			}
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("error searching for binary: %w", err)
	}
	if binaryPath == "" {
		return nil, fmt.Errorf("could not find compiled binary (.hex/.bin)")
	}

	binaryData, err := ioutil.ReadFile(binaryPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read binary: %w", err)
	}

	// If upload port provided, attempt upload
	if req.UploadPort != "" {
		uploadArgs := []string{"upload", "--fqbn", fqbn, "--port", req.UploadPort, "--input", binaryPath}
		cmd = exec.Command(b.CliPath, uploadArgs...)
		cmd.Dir = tempDir
		out, err := cmd.CombinedOutput()
		buildLog.WriteString("\n--- Upload output ---\n")
		buildLog.Write(out)
		if err != nil {
			buildLog.WriteString(fmt.Sprintf("\nUpload failed: %v", err))
		} else {
			buildLog.WriteString("\nUpload successful")
		}
	}

	return &BuildResponse{
		BinaryData: binaryData,
		BuildLog:   buildLog.String(),
	}, nil
}
