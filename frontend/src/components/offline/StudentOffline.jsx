'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Download,
  RefreshCw,
  BookOpen,
  FileText,
  Video,
  HardDriveDownload,
  ChevronDown,
  Package,
  CloudOff,
  Wifi,
  List,
  Grid,
} from 'lucide-react';
import OfflineStatusPanel from '@/components/system/OfflineStatusPanel';
import OfflineLibraryViewer from '@/components/offline/viewers/OfflineLibraryViewer';
import OfflineCourseDownloader from '@/components/offline/OfflineCourseDownloader';
import DownloadManager from '@/components/offline/DownloadManager';
import { Badge } from '@/components/ui/badge';

export default function StudentOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeControl, setActiveControl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderControlContent = () => {
    switch (activeControl) {
      case 'status':
        return <OfflineStatusPanel />;
      case 'downloads':
        return <DownloadManager />;
      case 'packages':
        return <OfflineCourseDownloader />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Offline Library Viewer */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <OfflineLibraryViewer viewMode={viewMode} />
        </div>
      </div>
      {activeControl && (
  <div className="w-full bg-white border-t shadow-inner transition-all duration-300 max-h-[300px] overflow-y-auto">
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Panel Content */}
      {renderControlContent()}

      {/* Collapse Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveControl(null)}
          className="text-gray-500 hover:text-gray-700 transition group"
        >
          <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
          <span className="sr-only">Collapse</span>
        </Button>
      </div>
    </div>
  </div>
)}

      {/* Bottom Control Panel */}
      <div className="w-full bg-white border-t p-4 shadow-md z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          {/* Controls: Dropdown + Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full md:w-auto">
                  {activeControl === 'status' && <HardDriveDownload className="h-4 w-4" />}
                  {activeControl === 'downloads' && <Download className="h-4 w-4" />}
                  {activeControl === 'packages' && <Package className="h-4 w-4" />}
                  {activeControl ? (
                    <>
                      {activeControl === 'status' && 'Offline Status'}
                      {activeControl === 'downloads' && 'Downloads'}
                      {activeControl === 'packages' && 'Course Packages'}
                    </>
                  ) : (
                    'More Tools'
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setActiveControl('status')}>
                  <HardDriveDownload className="h-4 w-4 mr-2" />
                  Offline Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveControl('downloads')}>
                  <Download className="h-4 w-4 mr-2" />
                  Downloads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveControl('packages')}>
                  <Package className="h-4 w-4 mr-2" />
                  Course Packages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* View Toggle + Network Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <CloudOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Optional Panel Expansion */}
   
</div>
  );
}
