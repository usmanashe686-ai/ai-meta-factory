import { NextRequest, NextResponse } from 'next/server'
import { ExpoProjectGenerator } from '@/lib/export/mobile/expo-generator'
import { APKBuilder } from '@/lib/export/mobile/apk-builder'
import { APKTester } from '@/lib/export/mobile/apk-tester'

export async function POST(request: NextRequest) {
  try {
    const { project, components, buildMethod } = await request.json()

    if (!project || !components) {
      return NextResponse.json(
        { success: false, error: 'Missing project or components' },
        { status: 400 }
      )
    }

    // 1. Generate Expo project
    const projectBlob = await ExpoProjectGenerator.generateProject(project, components)
    
    // Create temporary directory
    const tempDir = `/data/data/com.termux/files/home/temp-export-${Date.now()}`
    const fs = await import('fs/promises')
    const path = await import('path')
    
    await fs.mkdir(tempDir, { recursive: true })
    
    // Save blob to file
    const buffer = Buffer.from(await projectBlob.arrayBuffer())
    const zipPath = path.join(tempDir, `${project.name}-mobile.zip`)
    await fs.writeFile(zipPath, buffer)

    let result: any = { success: true }

    // 2. Based on build method
    switch (buildMethod) {
      case 'eas':
        // For EAS build, we'd need Expo credentials
        // For now, return the project files
        result.downloadUrl = `/api/download?file=${encodeURIComponent(zipPath)}`
        result.message = 'Expo project generated. Upload to EAS for APK build.'
        break

      case 'local':
        // Test if Termux can build locally
        const termuxReady = await APKTester.quickTermuxTest()
        if (termuxReady) {
          const buildResult = await APKBuilder.buildLocally(tempDir)
          result = { ...result, ...buildResult }
        } else {
          result.message = 'Termux build tools not available. Use EAS cloud build.'
          result.downloadUrl = `/api/download?file=${encodeURIComponent(zipPath)}`
        }
        break

      case 'instructions':
        const instructions = await APKBuilder.generateBuildInstructions(tempDir)
        result.instructions = instructions
        result.downloadUrl = `/api/download?file=${encodeURIComponent(zipPath)}`
        break

      default:
        result.downloadUrl = `/api/download?file=${encodeURIComponent(zipPath)}`
        result.message = 'Project files ready for download'
    }

    // 3. Run tests on generated project
    const testResult = await APKTester.testProject(tempDir)
    result.tests = testResult

    // Clean up after 1 hour
    setTimeout(async () => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    }, 3600000)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Mobile export error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Helper: Create download endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const filePath = searchParams.get('file')

  if (!filePath) {
    return NextResponse.json(
      { error: 'File parameter required' },
      { status: 400 }
    )
  }

  try {
    const fs = await import('fs/promises')
    await fs.access(filePath)
    
    const fileBuffer = await fs.readFile(filePath)
    const fileName = filePath.split('/').pop() || 'export.zip'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}
