import { useState, useCallback, useEffect } from 'react';
import { FolderItem } from '@/shared/types/index';
import { fetchFolderNotebooks } from '../services/notebooksApi';
import { NotebookItem } from '@/shared/types/index';

export interface UseFolderExpansionProps {
  folders?: FolderItem[];
}

export interface UseFolderExpansionReturn {
  expandedFolderId: string | null;
  folderNotebooks: Record<string, NotebookItem[]>;
  loadingFolderNotebooks: Set<string>;
  toggleFolderExpansion: (folderId: string) => Promise<void>;
}

export function useFolderExpansion({ folders = [] }: UseFolderExpansionProps): UseFolderExpansionReturn {
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [folderNotebooks, setFolderNotebooks] = useState<Record<string, NotebookItem[]>>({});
  const [loadingFolderNotebooks, setLoadingFolderNotebooks] = useState<Set<string>>(new Set());

  // Clear folder notebooks cache when folders change to ensure fresh data
  useEffect(() => {
    setFolderNotebooks({});
  }, [folders]);

  const toggleFolderExpansion = useCallback(async (folderId: string) => {
    if (expandedFolderId === folderId) {
      setExpandedFolderId(null);
    } else {
      setExpandedFolderId(folderId);
      // Always reload notebooks for this folder to ensure fresh data
      setLoadingFolderNotebooks(prev => new Set(prev).add(folderId));
      try {
        const notebooks = await fetchFolderNotebooks(folderId);
        setFolderNotebooks(prev => ({ ...prev, [folderId]: notebooks }));
      } catch (error) {
        console.error('Failed to load folder notebooks:', error);
      } finally {
        setLoadingFolderNotebooks(prev => {
          const newSet = new Set(prev);
          newSet.delete(folderId);
          return newSet;
        });
      }
    }
  }, [expandedFolderId]);

  return {
    expandedFolderId,
    folderNotebooks,
    loadingFolderNotebooks,
    toggleFolderExpansion,
  };
}
