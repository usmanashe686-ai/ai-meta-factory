import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component, 
  fallback = <DefaultFallback /> 
}) => {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
      <p className="mt-2 text-gray-500">Loading...</p>
    </div>
  </div>
);

// Pre-configured lazy components
export const LazyTemplateGallery = lazy(() => 
  import('@/components/templates/TemplateGallery').then(module => ({
    default: module.TemplateGallery
  }))
);

export const LazyTeamSidebar = lazy(() =>
  import('@/components/team/TeamSidebar').then(module => ({
    default: module.TeamSidebar
  }))
);

export const LazyVersionHistory = lazy(() =>
  import('@/components/versioning/VersionHistory').then(module => ({
    default: module.VersionHistory
  }))
);

export const LazyProjectHeader = lazy(() =>
  import('@/components/ProjectHeader').then(module => ({
    default: module.ProjectHeader
  }))
);
