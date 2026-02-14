"use node";
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { MistralOCRService } from '../lib/extraction/MistralOCRService';
import { SupadataLoaderService } from '../lib/extraction/SupadataLoaderService';
import {
  extractDocumentMetadata,
  getFileExtension,
  type DocumentMetadata,
} from '../lib/processing/DocumentMetadataExtractor';
import {
  StructuralChunker,
  type ChunkWithMetadata,
} from '../lib/processing/StructuralChunker';

// File extensions that require OCR processing
const OCR_FILE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.avif',
  '.pdf',
  '.pptx',
  '.docx',
];

/**
 * Check if a file requires OCR processing based on its extension
 */
function needsOCR(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return OCR_FILE_EXTENSIONS.includes(ext);
}


/**
 * Document embedding job handler
 * This is an internal action that handles document processing and embedding
 */
export const docEmbedding = internalAction({
  args: {
    documentId: v.id('documents'),
    userId: v.string(),
    notebookId: v.id('notebooks'),
  },
  handler: async (ctx, args) => {
    "use node";

    const { documentId, userId, notebookId } = args;

    console.log('[DocEmbedding] Processing document:', documentId);

    try {
      // Update status to processing
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId,
        status: 'processing',
      });

      // Get document details
      const docDetails = await ctx.runQuery(internal.documents.getDocumentDetails, {
        documentId,
      });

      let extractedText = '';
      let extractedTitle: string | undefined;

      // Step 1: Extraction
      console.log('[DocEmbedding] Step 1: Extracting content...');

      const mistralOCR = new MistralOCRService(process.env.MISTRAL_API_KEY || '');
      const supadataLoader = new SupadataLoaderService();

      if (docDetails.fileType === 'youtube') {
        const meta = await supadataLoader.loadTranscriptWithMeta(docDetails.fileUrl || '');
        extractedText = meta.content;
        if (meta.title?.trim()) extractedTitle = meta.title.trim();
        // When transcript has no title we use the videoId fallback in Step 3 (no metadata API call)
      } else if (docDetails.fileType === 'text') {
        // Text is already extracted, stored in metadata
        extractedText = docDetails.fileUrl || ''; // fileUrl contains the text for type 'text'
      } else if (docDetails.fileType === 'file') {
        if (!docDetails.storageId && !docDetails.fileUrl) {
          throw new Error('File storage ID or URL not found for document: ' + documentId);
        }

        // Check if file needs OCR or can be read directly as text
        if (needsOCR(docDetails.fileName)) {
          console.log(`[DocEmbedding] File '${docDetails.fileName}' requires OCR processing`);

          // Get file URL from Convex storage
          let fileUrl = docDetails.fileUrl;
          if (!fileUrl && docDetails.storageId) {
            // If we have a storageId, get the URL from Convex storage
            fileUrl = await ctx.storage.getUrl(docDetails.storageId) ?? undefined;
          }

          if (!fileUrl) {
            throw new Error('Could not get file URL for document: ' + documentId);
          }

          extractedText = await mistralOCR.processDocument(fileUrl);
        } else {
          console.log(`[DocEmbedding] File '${docDetails.fileName}' is plaintext, reading directly (no OCR)`);

          // For text files, read from storage or URL
          if (docDetails.storageId) {
            // Read from Convex storage
            const file = await ctx.storage.get(docDetails.storageId);
            if (!file) {
              throw new Error('File not found in storage');
            }
            extractedText = await file.text();
          } else if (docDetails.fileUrl) {
            // For external URLs, we'd need to fetch them
            // This is a placeholder - implement URL fetching if needed
            extractedText = '';
          }
        }
      } else if (docDetails.fileType === 'url') {
        const meta = await supadataLoader.loadWebPageWithMeta(docDetails.fileUrl || '');
        extractedText = meta.content;
        if (meta.title?.trim()) extractedTitle = meta.title.trim();
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text extracted from document');
      }

      // Sanitize extracted text
      const originalLength = extractedText.length;
      extractedText = extractedText.replace(/\u0000/g, '');
      if (originalLength !== extractedText.length) {
        console.warn(`[DocEmbedding] Removed ${originalLength - extractedText.length} null byte(s)`);
      }

      console.log(`[DocEmbedding] Extracted ${extractedText.length} characters`);

      // Step 2: Extract document-level metadata and split text with structural context
      console.log('[DocEmbedding] Step 2: Extracting metadata and splitting text...');

      const fileExtension = getFileExtension(docDetails.fileName);
      const docMetadata = extractDocumentMetadata(extractedText, fileExtension);
      console.log('[DocEmbedding] Document metadata:', {
        wordCount: docMetadata.wordCount,
        readingTime: docMetadata.estimatedReadingTimeMinutes,
        structure: docMetadata.documentStructure,
        language: docMetadata.language,
      });

      // Use structural chunker for enhanced metadata
      const chunker = new StructuralChunker();
      const chunksWithMetadata = await chunker.chunk(extractedText, 1000, 200);
      console.log(`[DocEmbedding] Split into ${chunksWithMetadata.length} chunks with metadata`);

      // Step 3: Set title from source
      console.log('[DocEmbedding] Step 3: Setting title from source...');
      let title: string;

      if (docDetails.fileType === 'file') {
        // Keep full file name (with extension) so the UI can show correct type (PDF, DOCX, etc.)
        title = docDetails.fileName || '';
      } else if (docDetails.fileType === 'url') {
        title = extractedTitle || (() => {
          try {
            return new URL(docDetails.fileUrl || '').hostname;
          } catch {
            return docDetails.fileUrl || 'Web Page';
          }
        })();
      } else if (docDetails.fileType === 'youtube') {
        title = extractedTitle || (() => {
          const match = (docDetails.fileUrl || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          return match ? `YouTube: ${match[1]}` : 'YouTube Video';
        })();
      } else {
        // For text input
        title = 'Pasted Text';
      }

      console.log(`[DocEmbedding] Set title: ${title}`);

      await ctx.runMutation(internal.documents.updateTitle, {
        documentId,
        title,
      });

      // Store document-level metadata
      await ctx.runMutation(internal.documents.updateMetadata, {
        documentId,
        metadata: {
          wordCount: docMetadata.wordCount,
          estimatedReadingTimeMinutes: docMetadata.estimatedReadingTimeMinutes,
          totalPages: docMetadata.totalPages ?? undefined,
          totalChunks: chunksWithMetadata.length,
          hasCodeBlocks: docMetadata.hasCodeBlocks,
          hasMathNotation: docMetadata.hasMathNotation,
          hasTables: docMetadata.hasTables,
          hasImages: docMetadata.hasImages,
          language: docMetadata.language,
          documentStructure: docMetadata.documentStructure,
          maxHeadingLevel: docMetadata.maxHeadingLevel,
        },
      });

      // Step 4: Generate embeddings via shared lib (uses OpenAI; cacheable per chunk)
      console.log('[DocEmbedding] Step 4: Generating embeddings...');

      const embeddingVectors = await Promise.all(
        chunksWithMetadata.map((chunk) =>
          ctx.runAction(internal.lib.embeddings.generateEmbeddingInternal, { text: chunk.content })
        )
      );

      // Store chunks with embeddings and metadata
      for (let i = 0; i < chunksWithMetadata.length; i++) {
        const chunk = chunksWithMetadata[i];
        await ctx.runMutation(internal.documents.storeChunk, {
          documentId,
          userId: userId as any,
          notebookId,
          content: chunk.content,
          chunkIndex: chunk.metadata.chunkIndex,
          embedding: embeddingVectors[i],
          metadata: {
            totalChunks: chunk.metadata.totalChunks ?? undefined,
            relativePosition: chunk.metadata.relativePosition ?? undefined,
            chunkLengthChars: chunk.metadata.chunkLengthChars ?? undefined,
            wordCount: chunk.metadata.wordCount ?? undefined,
            sentenceCount: chunk.metadata.sentenceCount ?? undefined,
            pageNumber: chunk.metadata.pageNumber ?? undefined,
            sectionTitle: chunk.metadata.sectionTitle ?? undefined,
            sectionLevel: chunk.metadata.sectionLevel ?? undefined,
            headingPath: chunk.metadata.headingPath ?? undefined,
            previousChunkPreview: chunk.metadata.previousChunkPreview ?? undefined,
            nextChunkPreview: chunk.metadata.nextChunkPreview ?? undefined,
            hasCodeBlock: chunk.metadata.hasCodeBlock ?? undefined,
            hasMathNotation: chunk.metadata.hasMathNotation ?? undefined,
            hasTable: chunk.metadata.hasTable ?? undefined,
            hasBulletList: chunk.metadata.hasBulletList ?? undefined,
            hasNumberedList: chunk.metadata.hasNumberedList ?? undefined,
          },
        });
      }

      console.log('[DocEmbedding] Embeddings generated and stored');

      // Update status to completed
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId,
        status: 'completed',
      });

      console.log(`[DocEmbedding] Document ${documentId} processed successfully`);
    } catch (error) {
      console.error('[DocEmbedding] Error processing document:', documentId, error);

      // Mark as failed
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId,
        status: 'failed',
      });

      // Store error in metadata
      await ctx.runMutation(internal.documents.patch, {
        documentId,
        patch: {
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });

      throw error;
    }
  },
});
