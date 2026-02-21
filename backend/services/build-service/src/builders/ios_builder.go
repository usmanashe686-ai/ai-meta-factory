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

// IosBuilder handles building iOS projects into IPA files.
type IosBuilder struct {
	// Working directory for builds
	WorkDir string
}

// BuildRequest contains parameters for building an IPA.
type BuildRequest struct {
	// ProjectZip is the raw ZIP data of the iOS project (e.g., a Capacitor or React Native project)
	ProjectZip []byte
	// AppName is the name of the app
	AppName string
	// BundleIdentifier (e.g., com.example.app)
	BundleIdentifier string
	// Version (e.g., "1.0.0")
	Version string
	// BuildNumber (e.g., 1)
	BuildNumber int
	// ProvisioningProfile (base64 encoded or path)
	ProvisioningProfile string
	// SigningIdentity (e.g., "iPhone Distribution: ...")
	SigningIdentity string
	// Development team ID
	TeamID string
	// ExportMethod (app-store, ad-hoc, development, enterprise)
	ExportMethod string
}

// BuildResponse contains the result of a build.
type BuildResponse struct {
	// IpaData is the built IPA file content
	IpaData []byte
	// BuildLog contains the output from the build process
	BuildLog string
	// Error message if any
	Error string
}

// NewIosBuilder creates a new iOS builder with a working directory.
func NewIosBuilder(workDir string) *IosBuilder {
	return &IosBuilder{WorkDir: workDir}
}

// Build runs the iOS build process for the given project.
func (b *IosBuilder) Build(req *BuildRequest) (*BuildResponse, error) {
	// Create a temporary directory for this build
	tempDir, err := ioutil.TempDir(b.WorkDir, "iosbuild-")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir) // clean up after build

	log.Printf("Building iOS IPA in %s", tempDir)

	// Extract project zip
	if err := unzipProject(req.ProjectZip, tempDir); err != nil {
		return nil, fmt.Errorf("failed to extract project: %w", err)
	}

	// Depending on the project type, we might need to install pods, etc.
	// For now, assume it's a Capacitor or React Native project that has an ios/ folder.

	// Change to the iOS project directory (usually ios/ inside the extracted project)
	iosDir := filepath.Join(tempDir, "ios")
	if _, err := os.Stat(iosDir); os.IsNotExist(err) {
		// If no ios/ folder, maybe it's already an Xcode project at root?
		iosDir = tempDir
	}

	// Update project configuration (e.g., set bundle identifier, version)
	if err := updateXcodeProject(iosDir, req); err != nil {
		log.Printf("Warning: could not update Xcode project: %v", err)
	}

	// Run xcodebuild to archive
	archivePath := filepath.Join(tempDir, "build", "app.xcarchive")
	cmd := exec.Command("xcodebuild", "archive",
		"-workspace", findWorkspace(iosDir),
		"-scheme", req.AppName,
		"-archivePath", archivePath,
		"CODE_SIGN_IDENTITY="+req.SigningIdentity,
		"PROVISIONING_PROFILE_SPECIFIER="+req.ProvisioningProfile,
		"DEVELOPMENT_TEAM="+req.TeamID,
	)
	cmd.Dir = iosDir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Running xcodebuild archive in %s", iosDir)
	err = cmd.Run()
	buildLog := stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("xcodebuild archive failed: %v", err),
		}, nil
	}

	// Export IPA from archive
	exportOptionsPlist := generateExportOptions(req)
	exportOptionsPath := filepath.Join(tempDir, "exportOptions.plist")
	if err := ioutil.WriteFile(exportOptionsPath, []byte(exportOptionsPlist), 0644); err != nil {
		return nil, fmt.Errorf("failed to write export options: %w", err)
	}

	ipaExportDir := filepath.Join(tempDir, "build", "ipa")
	if err := os.MkdirAll(ipaExportDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create ipa export dir: %w", err)
	}

	cmd = exec.Command("xcodebuild", "-exportArchive",
		"-archivePath", archivePath,
		"-exportPath", ipaExportDir,
		"-exportOptionsPlist", exportOptionsPath,
	)
	cmd.Dir = iosDir
	stdout.Reset()
	stderr.Reset()
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	log.Printf("Exporting IPA from archive...")
	err = cmd.Run()
	buildLog += "\n" + stdout.String() + "\n" + stderr.String()
	if err != nil {
		return &BuildResponse{
			BuildLog: buildLog,
			Error:    fmt.Sprintf("xcodebuild export failed: %v", err),
		}, nil
	}

	// Locate the generated IPA (usually app.ipa or similar)
	ipaPath := filepath.Join(ipaExportDir, req.AppName+".ipa")
	if _, err := os.Stat(ipaPath); os.IsNotExist(err) {
		// Fallback: maybe just .ipa
		ipaPath = filepath.Join(ipaExportDir, "app.ipa")
	}
	ipaData, err := ioutil.ReadFile(ipaPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read IPA file: %w", err)
	}

	return &BuildResponse{
		IpaData:  ipaData,
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

// findWorkspace returns the first .xcworkspace or .xcodeproj in the directory.
func findWorkspace(dir string) string {
	// Look for .xcworkspace first
	files, _ := filepath.Glob(filepath.Join(dir, "*.xcworkspace"))
	if len(files) > 0 {
		return files[0]
	}
	// Fallback to .xcodeproj
	files, _ = filepath.Glob(filepath.Join(dir, "*.xcodeproj"))
	if len(files) > 0 {
		return files[0]
	}
	return "" // will cause error
}

// updateXcodeProject updates plist or project.pbxproj with bundle ID, version, etc.
// This is a placeholder; in reality you'd use PlistBuddy or similar.
func updateXcodeProject(iosDir string, req *BuildRequest) error {
	// For simplicity, assume we update Info.plist using PlistBuddy (macOS only)
	infoPlist := filepath.Join(iosDir, req.AppName, "Info.plist")
	if _, err := os.Stat(infoPlist); err == nil {
		// Use PlistBuddy to set CFBundleIdentifier, CFBundleShortVersionString, CFBundleVersion
		commands := []struct {
			key   string
			value string
		}{
			{"CFBundleIdentifier", req.BundleIdentifier},
			{"CFBundleShortVersionString", req.Version},
			{"CFBundleVersion", fmt.Sprintf("%d", req.BuildNumber)},
		}
		for _, cmd := range commands {
			exec.Command("/usr/libexec/PlistBuddy", "-c", fmt.Sprintf("Set :%s %s", cmd.key, cmd.value), infoPlist).Run()
		}
	}
	return nil
}

// generateExportOptions creates an exportOptions.plist content.
func generateExportOptions(req *BuildRequest) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key>
	<string>%s</string>
	<key>teamID</key>
	<string>%s</string>
	<key>signingCertificate</key>
	<string>%s</string>
	<key>provisioningProfiles</key>
	<dict>
		<key>%s</key>
		<string>%s</string>
	</dict>
</dict>
</plist>`, req.ExportMethod, req.TeamID, req.SigningIdentity, req.BundleIdentifier, req.ProvisioningProfile)
}
