import { useEffect, useState } from 'react';
import { authenticatedFetch } from '../../../../utils/api';
import type { CodeEditorFile } from '../../types/types';

type CodeEditorImageFileProps = {
  file: CodeEditorFile;
  projectPath?: string;
  isSidebar: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
  loadingLabel: string;
  errorLabel: string;
  closeLabel: string;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
};

export default function CodeEditorImageFile({
  file,
  projectPath,
  isSidebar,
  isFullscreen,
  onClose,
  onToggleFullscreen,
  loadingLabel,
  errorLabel,
  closeLabel,
  fullscreenLabel,
  exitFullscreenLabel,
}: CodeEditorImageFileProps) {
  const projectId = file.projectId ?? projectPath;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError(errorLabel);
      return;
    }

    let objectUrl: string | null = null;
    const controller = new AbortController();

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageUrl(null);

        const url = `/api/projects/${projectId}/files/content?path=${encodeURIComponent(file.path)}`;
        const response = await authenticatedFetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (loadError: unknown) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return;
        }
        console.error('Error loading image:', loadError);
        setError(errorLabel);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [errorLabel, file.path, projectId]);

  const body = (
    <div className="flex h-full w-full items-center justify-center bg-background p-4">
      {loading && (
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      )}
      {!loading && imageUrl && (
        <img
          src={imageUrl}
          alt={file.name}
          className="max-h-full max-w-full rounded-md object-contain shadow-md"
        />
      )}
      {!loading && !imageUrl && (
        <div className="text-center text-sm text-muted-foreground">
          <p>{error ?? errorLabel}</p>
          <p className="mt-2 break-all">{file.path}</p>
        </div>
      )}
    </div>
  );

  if (isSidebar) {
    return (
      <div className="flex h-full w-full flex-col bg-background">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            title={closeLabel}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {body}
      </div>
    );
  }

  const containerClassName = isFullscreen
    ? 'fixed inset-0 z-[9999] bg-background flex flex-col'
    : 'fixed inset-0 z-[9999] md:bg-black/50 md:flex md:items-center md:justify-center md:p-4';

  const innerClassName = isFullscreen
    ? 'bg-background flex flex-col w-full h-full'
    : 'bg-background shadow-2xl flex flex-col w-full h-full md:rounded-lg md:shadow-2xl md:w-full md:max-w-6xl md:h-[80vh] md:max-h-[80vh]';

  return (
    <div className={containerClassName}>
      <div className={innerClassName}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              title={isFullscreen ? exitFullscreenLabel : fullscreenLabel}
            >
              {isFullscreen ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              title={closeLabel}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {body}
      </div>
    </div>
  );
}
