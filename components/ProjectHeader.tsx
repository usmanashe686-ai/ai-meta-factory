import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Save, 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  History,
  Download,
  Upload,
  Users,
  Lock,
  Unlock,
  GitCompare,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useProjectStore } from '@/store/project-store';
import { useSocket } from '@/lib/socket/useSocket';
import { VersionHistory } from './versioning/VersionHistory';
import { VersionCompare } from './versioning/VersionCompare';
import toast from 'react-hot-toast';
import { ProjectExporter } from '@/lib/persistence/exportImport';

interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectId }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<[string?, string?]>([undefined, undefined]);
  const [userCount, setUserCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const { isSaving, lastSaved, hasUnsavedChanges, manualSave, saveStatus } = useAutoSave(projectId);
  const { metadata, components, layout } = useProjectStore();
  const { socket, isConnected, joinProject, leaveProject, requestLock, releaseLock } = useSocket({
    onRemoteSave: (data) => {
      if (data.projectId === projectId) {
        toast.info(`${data.userName || 'Another user'} saved changes`, {
          duration: 3000,
          position: 'bottom-right'
        });
      }
    },
    onUserJoined: (data) => {
      setUserCount(data.userCount);
      toast.info('New user joined the project', {
        duration: 2000,
        position: 'bottom-right'
      });
    },
    onUserLeft: (data) => {
      setUserCount(data.userCount);
      if (data.reason !== 'disconnect') {
        toast.info('User left the project', {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    },
    onLockAcquired: (data) => {
      if (data.projectId === projectId) {
        setIsLocked(true);
        setLockedBy(socket?.id || null);
      }
    },
    onLockReleased: (data) => {
      if (data.projectId === projectId) {
        setIsLocked(false);
        setLockedBy(null);
      }
    }
  });

  useEffect(() => {
    if (isConnected && projectId) {
      joinProject(projectId);
    }

    return () => {
      if (isConnected && projectId) {
        leaveProject(projectId);
      }
    };
  }, [isConnected, projectId, joinProject, leaveProject]);

  const handleExport = () => {
    const projectData = {
      components,
      layout,
      metadata: {
        ...metadata,
        exportedAt: new Date().toISOString()
      }
    };
    
    const exportResult = ProjectExporter.exportProject(projectData, 'json');
    
    const link = document.createElement('a');
    link.href = exportResult.dataUri;
    link.download = `${metadata.name || 'project'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Project exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (importedData.project || (importedData.components && importedData.layout)) {
          const projectData = importedData.project || importedData;
          
          useProjectStore.setState({
            components: projectData.components,
            layout: projectData.layout,
            metadata: {
              ...projectData.metadata,
              id: projectId,
              lastModified: new Date().toISOString()
            }
          });
          
          toast.success('Project imported successfully!');
        } else {
          throw new Error('Invalid project file format');
        }
      } catch (error) {
        toast.error('Failed to import project');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const toggleLock = () => {
    if (isLocked && lockedBy === socket?.id) {
      releaseLock(projectId);
      toast.success('Lock released');
    } else if (!isLocked) {
      requestLock(projectId);
    } else {
      toast.error('Project is locked by another user');
    }
  };

  const handleCompare = () => {
    if (selectedVersions[0] && selectedVersions[1]) {
      setShowCompare(true);
    } else {
      toast.error('Please select two versions to compare');
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-yellow-600';
      case 'saved': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Cloud className="w-4 h-4 animate-pulse" />;
      case 'saved': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {metadata.name || 'Untitled Project'}
          </h1>
          
          {/* Save Status & Collaboration Info */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${getSaveStatusColor()}`}>
              {getSaveStatusIcon()}
              <span>
                {isSaving ? 'Saving...' : 
                 hasUnsavedChanges ? 'Unsaved changes' : 
                 lastSaved ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}` : 
                 'All changes saved'}
              </span>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center gap-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            {/* User Count */}
            {isConnected && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Users className="w-4 h-4" />
                <span>{userCount} user{userCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {/* Lock Status */}
            {isConnected && (
              <button
                onClick={toggleLock}
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded ${isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                title={isLocked ? `Locked by ${lockedBy === socket?.id ? 'you' : 'another user'}` : 'Click to lock'}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isLocked ? 'Locked' : 'Unlocked'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Version Compare */}
          <div className="relative">
            <button
              onClick={() => setShowCompare(true)}
              disabled={!selectedVersions[0] || !selectedVersions[1]}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md ${selectedVersions[0] && selectedVersions[1] ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </button>
          </div>

          {/* Version History */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            <History className="w-4 h-4" />
            History
          </button>

          {/* Import Button */}
          <label className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Save Button */}
          <button
            onClick={manualSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistory
        projectId={projectId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={(version) => {
          useProjectStore.setState(version.snapshot);
          toast.success(`Restored to version ${version.version}`);
          setShowHistory(false);
        }}
      />

      {/* Version Compare Modal */}
      <VersionCompare
        projectId={projectId}
        version1Id={selectedVersions[0]}
        version2Id={selectedVersions[1]}
        onClose={() => {
          setShowCompare(false);
          setSelectedVersions([undefined, undefined]);
        }}
      />
    </header>
  );
};
