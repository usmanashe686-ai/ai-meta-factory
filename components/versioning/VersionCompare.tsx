import React, { useState, useEffect } from 'react';
import { VersionManager, ProjectVersion, VersionDiff } from '@/lib/persistence/versioning';
import { 
  GitCompare,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  Edit2,
  Move,
  X,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VersionCompareProps {
  projectId: string;
  version1Id?: string;
  version2Id?: string;
  onClose: () => void;
}

export const VersionCompare: React.FC<VersionCompareProps> = ({
  projectId,
  version1Id,
  version2Id,
  onClose
}) => {
  const [version1, setVersion1] = useState<ProjectVersion | null>(null);
  const [version2, setVersion2] = useState<ProjectVersion | null>(null);
  const [diffs, setDiffs] = useState<VersionDiff[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    if (version1Id && version2Id) {
      loadComparison();
    }
  }, [version1Id, version2Id]);

  const loadComparison = async () => {
    if (!version1Id || !version2Id) return;
    
    setLoading(true);
    try {
      const comparison = await VersionManager.compareVersions(version1Id, version2Id);
      setVersion1(comparison.version1);
      setVersion2(comparison.version2);
      setDiffs(comparison.diffs);
    } catch (error) {
      console.error('Failed to compare versions:', error);
      toast.error('Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const getDiffIcon = (type: VersionDiff['type']) => {
    switch (type) {
      case 'added': return <PlusCircle className="w-4 h-4 text-green-600" />;
      case 'removed': return <MinusCircle className="w-4 h-4 text-red-600" />;
      case 'modified': return <Edit2 className="w-4 h-4 text-blue-600" />;
      case 'moved': return <Move className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const getDiffColor = (type: VersionDiff['type']) => {
    switch (type) {
      case 'added': return 'bg-green-50 border-green-200';
      case 'removed': return 'bg-red-50 border-red-200';
      case 'modified': return 'bg-blue-50 border-blue-200';
      case 'moved': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredDiffs = showAll ? diffs : diffs.filter(d => d.type !== 'moved');

  const summary = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    moved: diffs.filter(d => d.type === 'moved').length,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-purple-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <GitCompare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Compare Versions
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Version headers */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Version 1</h4>
                      {version1 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 rounded">
                          v{version1.version}
                        </span>
                      )}
                    </div>
                    {version1 ? (
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(version1.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: <span style={{ color: version1.author.color }}>
                            {version1.author.name}
                          </span>
                        </p>
                        {version1.label && (
                          <p className="text-sm font-medium mt-1">{version1.label}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Select a version</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Version 2</h4>
                      {version2 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 rounded">
                          v{version2.version}
                        </span>
                      )}
                    </div>
                    {version2 ? (
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(version2.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: <span style={{ color: version2.author.color }}>
                            {version2.author.name}
                          </span>
                        </p>
                        {version2.label && (
                          <p className="text-sm font-medium mt-1">{version2.label}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Select a version</p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Changes Summary</h4>
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
                    >
                      {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showAll ? 'Hide moves' : 'Show all'}
                    </button>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{summary.added} added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MinusCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{summary.removed} removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{summary.modified} modified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">{summary.moved} moved</span>
                    </div>
                  </div>
                </div>

                {/* Diffs list */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Comparing versions...</p>
                    </div>
                  ) : filteredDiffs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No changes detected</p>
                      <p className="text-sm text-gray-400 mt-1">
                        The versions appear to be identical
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredDiffs.map((diff, index) => (
                        <div
                          key={`${diff.componentId}-${index}`}
                          className={`p-4 border rounded-lg ${getDiffColor(diff.type)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getDiffIcon(diff.type)}
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {diff.componentName}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {diff.componentType} • {diff.type.charAt(0).toUpperCase() + diff.type.slice(1)}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setSelectedDiff(
                                selectedDiff === diff.componentId ? null : diff.componentId
                              )}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              {selectedDiff === diff.componentId ? 'Hide' : 'Show'} details
                            </button>
                          </div>
                          
                          {selectedDiff === diff.componentId && (
                            <div className="mt-3 pt-3 border-t">
                              {diff.type === 'moved' && diff.positionChange && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="text-gray-600">
                                    Position: ({diff.positionChange.from.x}, {diff.positionChange.from.y})
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <div className="text-gray-600">
                                    ({diff.positionChange.to.x}, {diff.positionChange.to.y})
                                  </div>
                                </div>
                              )}
                              
                              {(diff.type === 'modified' || diff.type === 'added' || diff.type === 'removed') && (
                                <div className="grid grid-cols-2 gap-4">
                                  {diff.before && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-500 mb-1">Before</h6>
                                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                                        {JSON.stringify(diff.before, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {diff.after && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-500 mb-1">After</h6>
                                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                                        {JSON.stringify(diff.after, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
