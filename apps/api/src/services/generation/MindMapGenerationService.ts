import { supabase } from '../../config/database.js';
import { MindMapGraph, OverallStateType } from '../agents/MindMapGraph.js';
import { env } from '../../config/env.js';
import { TitleGeneratorService } from '../processing/TitleGeneratorService.js';

export interface MindMapGenerationParams {
  documentIds: string[];
  onStatusUpdate?: (status: string) => void;
}

export interface MindMapResult {
  data: any;
  metadata: {
    documentIds: string[];
    chunksProcessed: number;
  };
}

export interface SaveMindMapParams {
  mindMapId: string;
  title: string;
  data: any;
  metadata: any;
}

export class MindMapGenerationService {
  private mindMapGraph: MindMapGraph;
  private titleGenerator: TitleGeneratorService;

  constructor() {
    this.mindMapGraph = new MindMapGraph(
      env.TOGETHER_AI_API_KEY,
      env.TOGETHER_AI_MODEL,
      parseInt(env.REPORT_MAX_TOKENS, 10)
    );
    this.titleGenerator = new TitleGeneratorService(env.TOGETHER_AI_API_KEY, env.TOGETHER_AI_MODEL);
  }

  async generateMindMap(params: MindMapGenerationParams): Promise<MindMapResult> {
    const { documentIds, onStatusUpdate } = params;

    try {
      // Update status
      onStatusUpdate?.('generating');

      // Fetch chunks from selected documents
      const chunks = await this.fetchChunks(documentIds);

      if (chunks.length === 0) {
        throw new Error('No content found in selected documents');
      }

      console.log(
        `[MindMapGeneration] Processing ${chunks.length} chunks for mind map`
      );

      // Build and invoke graph
      const graph = this.mindMapGraph.buildGraph();
      const result = await graph.invoke({
        documentIds,
        chunks,
        mapOutputs: [],
        collapsedOutputs: [],
        finalOutput: null,
        status: 'generating',
      }) as unknown as OverallStateType;

      console.log(
        `[MindMapGeneration] Mind map generation completed. Status: ${result.status}`
      );

      return {
        data: result.finalOutput,
        metadata: {
          documentIds,
          chunksProcessed: chunks.length,
        },
      };
    } catch (error) {
      console.error('[MindMapGeneration] Error generating mind map:', error);
      throw error;
    }
  }

  async fetchChunks(documentIds: string[]): Promise<string[]> {
    try {
      console.log(`[MindMapGeneration] Fetching chunks for documents: ${documentIds.join(', ')}`);

      const { data, error } = await supabase
        .from('document_chunks')
        .select('content, document_id, chunk_index')
        .in('document_id', documentIds)
        .order('chunk_index', { ascending: true });

      if (error) {
        console.error('[MindMapGeneration] Error fetching chunks:', error);
        throw new Error(`Failed to fetch chunks: ${error.message}`);
      }

      const chunks = data?.map((d) => d.content) || [];
      console.log(`[MindMapGeneration] Fetched ${chunks.length} chunks`);

      // Debug: Log first chunk preview to verify content
      if (chunks.length > 0) {
        const firstChunkPreview = chunks[0]?.substring(0, 200) || 'EMPTY';
        console.log(`[MindMapGeneration] First chunk preview (${chunks[0]?.length || 0} chars): ${firstChunkPreview}...`);
      } else {
        console.warn('[MindMapGeneration] WARNING: No chunks found!');
      }

      // Check for empty chunks
      const emptyChunks = chunks.filter(c => !c || c.trim().length === 0);
      if (emptyChunks.length > 0) {
        console.warn(`[MindMapGeneration] WARNING: ${emptyChunks.length} empty chunks found!`);
      }

      return chunks;
    } catch (error) {
      console.error('[MindMapGeneration] Error in fetchChunks:', error);
      throw error;
    }
  }

  async saveMindMap(params: SaveMindMapParams): Promise<void> {
    try {
      const { error } = await supabase
        .from('mindmaps')
        .update({
          title: params.title,
          data: params.data,
          status: 'completed',
          metadata: params.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.mindMapId);

      if (error) {
        console.error('[MindMapGeneration] Error saving mind map:', error);
        throw new Error(`Failed to save mind map: ${error.message}`);
      }

      console.log(`[MindMapGeneration] Mind map saved: ${params.mindMapId}`);
    } catch (error) {
      console.error('[MindMapGeneration] Error in saveMindMap:', error);
      throw error;
    }
  }

  async updateMindMapStatus(
    mindMapId: string,
    status: string,
    metadata?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from('mindmaps')
        .update(updateData)
        .eq('id', mindMapId);

      if (error) {
        console.error('[MindMapGeneration] Error updating status:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }
    } catch (error) {
      console.error('[MindMapGeneration] Error in updateMindMapStatus:', error);
      throw error;
    }
  }

  getMindMapTitle(): string {
    return 'Mind Map';
  }

  getMindMapSubtitle(status: string): string {
    if (status === 'generating' || status === 'mapping' || status === 'collapsing' || status === 'reducing') {
      return 'Mind Map • Generating...';
    }
    if (status === 'failed') {
      return 'Mind Map • Failed';
    }
    return `Mind Map • Visual Overview`;
  }

  /**
   * Generate an AI-powered title from mind map content
   * Uses the root node topic to generate a descriptive title
   */
  async generateTitleFromContent(data: any): Promise<string> {
    try {
      // Extract root topic from mind map data
      const rootTopic = data?.nodeData?.topic || '';
      if (rootTopic) {
        console.log(`[MindMapGeneration] Using root topic as title: ${rootTopic}`);
        return rootTopic;
      }

      // Fallback: use first chunk to generate title
      const title = await this.titleGenerator.generateTitle('Mind map from documents');
      console.log(`[MindMapGeneration] Generated fallback title: ${title}`);
      return title;
    } catch (error) {
      console.error('[MindMapGeneration] Error generating title from content:', error);
      // Fallback to a default title if generation fails
      return 'Mind Map';
    }
  }

  /**
   * Generate a fallback title from source chunks (when content is empty)
   */
  async generateTitleFromChunks(chunks: string[]): Promise<string> {
    try {
      // Use the first chunk for title generation
      const title = await this.titleGenerator.generateTitle(chunks[0] || 'No content');
      console.log(`[MindMapGeneration] Generated title from chunks: ${title}`);
      return title;
    } catch (error) {
      console.error('[MindMapGeneration] Error generating title from chunks:', error);
      // Fallback to default title if generation fails
      return this.getMindMapTitle();
    }
  }
}
