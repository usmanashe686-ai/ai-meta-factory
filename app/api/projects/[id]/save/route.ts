import { NextRequest, NextResponse } from 'next/server';
import { VersionManager } from '@/lib/persistence/versioning';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const data = await request.json();
    
    console.log('Saving project:', projectId, 'version:', data.metadata.version);
    
    // Create version history
    await VersionManager.saveVersion(projectId, data);
    
    return NextResponse.json({
      success: true,
      version: data.metadata.version,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}
