import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { VersionManager, ProjectVersion } from '@/lib/persistence/versioning';
import { useProjectStore } from '@/store/project-store';
import { 
  History, 
  User, 
  PlusCircle, 
  Edit2, 
  Trash2,
  Download,
  RotateCcw,
  Tag,
  Filter,
  Search,
  Calendar,
  UserCircle,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Hash,
  Clock,
  Save,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VersionHistoryProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: ProjectVersion) => void;
}

type FilterType = 'all' | 'manual' | 'auto';
type SortType = 'newest' | 'oldest' | 'version';

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  projectId,
  isOpen,
  onClose,
  onRestore
}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [search, setSearch] = useState('');
  const [showAutoSaves, setShowAutoSaves] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { metadata } = useProjectStore();
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    versions.forEach(v => v.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [versions]);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, projectId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const versionList = await VersionManager.getVersions(projectId, {
        includeAutoSaves: showAutoSaves
      });
      setVersions(versionList);
    } catch (error) {
      console.error('Failed to load versions:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const filteredVersions = useMemo(() => {
    let filtered = [...versions];
    
    // Apply filter
    if (filter === 'manual') {
      filtered = filtered.filter(v => !v.isAutoSave);
    } else if (filter === 'auto') {
      filtered = filtered.filter(v => v.isAutoSave);
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v => 
        v.label?.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower) ||
        v.author.name.toLowerCase().includes(searchLower) ||
        v.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(v => 
        v.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sort === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else {
        return b.version - a.version;
      }
    });
    
    return filtered;
  }, [versions, filter, search, sort, selectedTags]);

  const handleRestore = async (version: ProjectVersion) => {
    if (confirm(`Restore to version ${version.version}? Current changes will be saved as a restore point.`)) {
      try {
        const result = await VersionManager.restoreVersion(version.id);
        if (result.success) {
          onRestore(version);
          toast.success(`Restored to version ${version.version}`);
          loadVersions(); // Refresh list
        }
      } catch (error) {
        toast.error('Failed to restore version');
        console.error('Restore error:', error);
      }
    }
  };

  const downloadVersion = (version: ProjectVersion) => {
    const dataStr = JSON.stringify(version.snapshot, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `project-v${version.version}-${version.timestamp.split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Version downloaded');
  };

  const copyVersionId = (versionId: string) => {
    navigator.clipboard.writeText(versionId);
    toast.success('Version ID copied to clipboard');
  };

  const addLabel = async (versionId: string) => {
    const label = prompt('Enter a label for this version:');
    if (label) {
      const description = prompt('Enter description (optional):');
      const success = await VersionManager.createLabel(versionId, label, description);
      if (success) {
        toast.success('Label added');
        loadVersions();
      } else {
        toast.error('Failed to add label');
      }
    }
  };

  const addTag = async (versionId: string, tag: string) => {
    const success = await VersionManager.addTags(versionId, [tag]);
    if (success) {
      toast.success(`Added tag: ${tag}`);
      loadVersions();
    } else {
      toast.error('Failed to add tag');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Version History
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Current: v{metadata.version}
                    </span>
                    <button
                      onClick={loadVersions}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Refresh"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search versions..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All saves</option>
                        <option value="manual">Manual saves</option>
                        <option value="auto">Auto-saves</option>
                      </select>
                      
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortType)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="version">By version</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => setShowAutoSaves(!showAutoSaves)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${showAutoSaves ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {showAutoSaves ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      Auto-saves
                    </button>
                  </div>
                  
                  {/* Tags filter */}
                  {allTags.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Tag className="w-4 h-4" />
                        Filter by tags:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 text-sm rounded-full ${selectedTags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {tag}
                          </button>
                        ))}
                        {selectedTags.length > 0 && (
                          <button
                            onClick={() => setSelectedTags([])}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Versions list */}
                <div className="mt-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading versions...</p>
                    </div>
                  ) : filteredVersions.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No versions found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {search || selectedTags.length > 0 || filter !== 'all' 
                          ? 'Try changing your filters' 
                          : 'Versions will appear as you save changes'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {filteredVersions.map((version) => (
                        <div
                          key={version.id}
                          className={`p-4 border rounded-lg transition-all ${
                            selectedVersion === version.id
                              ? 'border-blue-500 bg-blue-50'
                              : version.id === expandedVersion
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    version.isAutoSave 
                                      ? 'bg-gray-100 text-gray-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    <span className="flex items-center gap-1">
                                      <Hash className="w-3 h-3" />
                                      v{version.version}
                                    </span>
                                  </span>
                                  {version.label && (
                                    <span className="font-medium text-gray-900">{version.label}</span>
                                  )}
                                  {version.isAutoSave && (
                                    <span className="text-xs text-gray-500">Auto-save</span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {version.tags?.map(tag => (
                                    <span 
                                      key={tag} 
                                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(parseISO(version.timestamp), { addSuffix: true })}
                                </span>
                                
                                <span className="flex items-center gap-1">
                                  <UserCircle className="w-3 h-3" />
                                  <span 
                                    className="font-medium"
                                    style={{ color: version.author.color }}
                                  >
                                    {version.author.name}
                                  </span>
                                </span>
                                
                                {version.changes && (
                                  <div className="flex gap-3">
                                    {version.changes.added > 0 && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <PlusCircle className="w-3 h-3" />
                                        +{version.changes.added}
                                      </span>
                                    )}
                                    {version.changes.modified > 0 && (
                                      <span className="flex items-center gap-1 text-blue-600">
                                        <Edit2 className="w-3 h-3" />
                                        {version.changes.modified}
                                      </span>
                                    )}
                                    {version.changes.removed > 0 && (
                                      <span className="flex items-center gap-1 text-red-600">
                                        <Trash2 className="w-3 h-3" />
                                        -{version.changes.removed}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {version.description && (
                                <p className="mt-2 text-sm text-gray-700">{version.description}</p>
                              )}
                              
                              {version.changes?.summary && (
                                <p className="mt-1 text-xs text-gray-500">{version.changes.summary}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              <button
                                onClick={() => setExpandedVersion(
                                  expandedVersion === version.id ? null : version.id
                                )}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Show details"
                              >
                                {expandedVersion === version.id ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addLabel(version.id);
                                }}
                                className="p-1 text-gray-400 hover:text-yellow-600"
                                title="Add label"
                              >
                                <Tag className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyVersionId(version.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Copy version ID"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadVersion(version);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestore(version);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Expanded view */}
                          {expandedVersion === version.id && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Version Details</h4>
                                  <dl className="space-y-1 text-sm">
                                    <div className="flex">
                                      <dt className="w-24 text-gray-500">ID:</dt>
                                      <dd className="font-mono">{version.id}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="w-24 text-gray-500">Created:</dt>
                                      <dd>{new Date(version.timestamp).toLocaleString()}</dd>
                                    </div>
                                    <div className="flex">
                                      <dt className="w-24 text-gray-500">Author:</dt>
                                      <dd className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: version.author.color }}
                                        />
                                        {version.author.name}
                                      </dd>
                                    </div>
                                  </dl>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => handleRestore(version)}
                                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      Restore this version
                                    </button>
                                    <button
                                      onClick={() => {
                                        const tag = prompt('Enter a tag:');
                                        if (tag) addTag(version.id, tag);
                                      }}
                                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                                    >
                                      Add tag
                                    </button>
                                    <button
                                      onClick={() => downloadVersion(version)}
                                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                                    >
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
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
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
