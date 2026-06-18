import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserLimits } from "@/features/billing/services/subscriptionApi";
import { useToast } from "@/shared/contexts/useToast";
import { useLimitErrorToast } from "@/shared/hooks/useLimitErrorToast";
import { useCreateDocument, useUploadDocument } from "../services/documentsApi";

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".docx",
  ".pptx",
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".avif",
  ".wav",
  ".mp3",
  ".m4a",
  ".webm",
  ".flac",
];

interface UseSourceUploadProps {
  sourcesCount: number;
  userId?: string | null;
  noteId?: string | null;
  onDocumentUploaded?: (documentId: string) => void;
  sourceLimit?: number;
}

interface UseSourceUploadResult {
  // State
  isUploading: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // File upload handlers
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processFiles: (files: File[]) => Promise<void>;

  // URL/Social/Text upload handlers
  handleUrlUpload: (urls: string[]) => Promise<void>;
  handleSocialMediaUpload: (urls: string[]) => Promise<void>;
  handleTextUpload: (text: string) => Promise<void>;

  // Drag and drop handlers
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;

  // Helper
  parseUrls: (input: string) => string[];
}

/**
 * Custom hook for handling source uploads (files, URLs, social media, text)
 */
export function useSourceUpload({
  sourcesCount,
  userId,
  noteId,
  onDocumentUploaded,
  sourceLimit,
}: UseSourceUploadProps): UseSourceUploadResult {
  const uploadDocument = useUploadDocument();
  const createDocument = useCreateDocument();
  const userLimits = useUserLimits();
  const { handleLimitError } = useLimitErrorToast();
  const { error: showError, info: showInfo } = useToast();
  const { t } = useTranslation("sources");

  // Use provided limit or get from subscription
  const maxSources = sourceLimit ?? userLimits.sourceLimit;

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset dragging state when modal closes
  useEffect(() => {
    return () => {
      setIsDragging(false);
    };
  }, []);

  // Helper function to parse multiple URLs from input
  const parseUrls = (input: string): string[] => {
    return input
      .split(/\s+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && (url.startsWith("http://") || url.startsWith("https://")));
  };

  // Process files (used by both file input and drag & drop)
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    if (!userId || !noteId) {
      showInfo(t("uploadErrors.loginFiles"));
      return;
    }

    if (sourcesCount >= maxSources) {
      await handleLimitError(
        new Error(
          t("uploadErrors.sourceLimitReachedError", { count: sourcesCount, max: maxSources })
        ),
        {
          errorMessage: t("uploadErrors.sourceLimitReachedToast", {
            count: sourcesCount,
            max: maxSources,
          }),
          upgradeMessage: t("uploadErrors.sourceLimitUpgrade", { max: maxSources }),
        }
      );
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const response = await uploadDocument(file, noteId);
        onDocumentUploaded?.(response.documentId);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      const handled = await handleLimitError(err);
      if (!handled.isLimitError) {
        showError(err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback"));
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  // URL upload handler
  const handleUrlUpload = async (urls: string[]) => {
    if (!userId || !noteId) {
      showInfo(t("uploadErrors.loginUrls"));
      return;
    }

    if (sourcesCount >= maxSources) {
      await handleLimitError(
        new Error(
          t("uploadErrors.sourceLimitReachedError", { count: sourcesCount, max: maxSources })
        ),
        {
          errorMessage: t("uploadErrors.sourceLimitReachedToast", {
            count: sourcesCount,
            max: maxSources,
          }),
          upgradeMessage: t("uploadErrors.sourceLimitUpgrade", { max: maxSources }),
        }
      );
      return;
    }

    if (urls.length === 0) {
      showError(t("uploadErrors.invalidUrl"));
      return;
    }

    setIsUploading(true);
    try {
      const errors: string[] = [];
      for (const url of urls) {
        try {
          const result = await createDocument({
            notebookId: noteId,
            type: "url",
            source: url,
            fileName: url,
          });
          onDocumentUploaded?.(result.documentId);
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback");
          errors.push(`${url}: ${errorMsg}`);
          console.error(`URL upload failed for ${url}:`, err);
        }
      }

      if (errors.length > 0 && errors.length === urls.length) {
        showError(t("uploadErrors.allUrlsFailed", { errors: errors.join("; ") }), {
          duration: 10_000,
        });
        return;
      } else if (errors.length > 0) {
        showError(t("uploadErrors.someUrlsFailed", { errors: errors.join("; ") }), {
          duration: 10_000,
        });
      }
    } catch (err) {
      console.error("URL upload failed:", err);
      const handled = await handleLimitError(err);
      if (!handled.isLimitError) {
        showError(err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback"));
      }
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Social Media upload handler (YouTube, TikTok, Instagram, X)
  const handleSocialMediaUpload = async (urls: string[]) => {
    if (!userId || !noteId) {
      showInfo(t("uploadErrors.loginSocial"));
      return;
    }

    if (sourcesCount >= maxSources) {
      await handleLimitError(
        new Error(
          t("uploadErrors.sourceLimitReachedError", { count: sourcesCount, max: maxSources })
        ),
        {
          errorMessage: t("uploadErrors.sourceLimitReachedToast", {
            count: sourcesCount,
            max: maxSources,
          }),
          upgradeMessage: t("uploadErrors.sourceLimitUpgrade", { max: maxSources }),
        }
      );
      return;
    }

    if (urls.length === 0) {
      showError(t("uploadErrors.invalidUrl"));
      return;
    }

    setIsUploading(true);
    try {
      const errors: string[] = [];
      for (const url of urls) {
        try {
          const result = await createDocument({
            notebookId: noteId,
            type: "youtube",
            source: url,
            fileName: "YouTube Video",
          });
          onDocumentUploaded?.(result.documentId);
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback");
          errors.push(`${url}: ${errorMsg}`);
          console.error(`Social media upload failed for ${url}:`, err);
        }
      }

      if (errors.length > 0 && errors.length === urls.length) {
        showError(t("uploadErrors.allUrlsFailed", { errors: errors.join("; ") }), {
          duration: 10_000,
        });
        return;
      } else if (errors.length > 0) {
        showError(t("uploadErrors.someUrlsFailed", { errors: errors.join("; ") }), {
          duration: 10_000,
        });
      }
    } catch (err) {
      console.error("Social media upload failed:", err);
      const handled = await handleLimitError(err);
      if (!handled.isLimitError) {
        showError(err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback"));
      }
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Text upload handler
  const handleTextUpload = async (text: string) => {
    if (!userId || !noteId) {
      showInfo(t("uploadErrors.loginText"));
      return;
    }

    if (sourcesCount >= maxSources) {
      await handleLimitError(
        new Error(
          t("uploadErrors.sourceLimitReachedError", { count: sourcesCount, max: maxSources })
        ),
        {
          errorMessage: t("uploadErrors.sourceLimitReachedToast", {
            count: sourcesCount,
            max: maxSources,
          }),
          upgradeMessage: t("uploadErrors.sourceLimitUpgrade", { max: maxSources }),
        }
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await createDocument({
        notebookId: noteId,
        type: "text",
        source: text,
        fileName: "Pasted text",
      });
      onDocumentUploaded?.(result.documentId);
    } catch (err) {
      console.error("Text upload failed:", err);
      const handled = await handleLimitError(err);
      if (!handled.isLimitError) {
        showError(err instanceof Error ? err.message : t("uploadErrors.uploadFailedFallback"));
      }
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (userId && noteId && sourcesCount < maxSources) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!userId || !noteId || sourcesCount >= maxSources) {
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return ACCEPTED_FILE_TYPES.includes(extension);
    });

    if (files.length === 0) {
      showInfo(
        t("uploadErrors.noSupportedFiles", {
          types: ACCEPTED_FILE_TYPES.map((type) => type.slice(1)).join(", "),
        })
      );
      return;
    }

    await processFiles(files);
  };

  return {
    // State
    isUploading,
    isDragging,
    fileInputRef,

    // Handlers
    handleFileSelect,
    processFiles,
    handleUrlUpload,
    handleSocialMediaUpload,
    handleTextUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,

    // Helper
    parseUrls,
  };
}
