import { supabase } from '../../config/database.js';
import { ReportGraph, OverallStateType } from '../agents/ReportGraph.js';
import { env } from '../../config/env.js';
import { TitleGeneratorService } from '../processing/TitleGeneratorService.js';

export interface ReportGenerationParams {
  documentIds: string[];
  reportType: string;
  customPrompt?: string;
  onStatusUpdate?: (status: string) => void;
}

export interface ReportResult {
  content: string;
  metadata: {
    reportType: string;
    documentIds: string[];
    chunksProcessed: number;
  };
}

export interface SaveReportParams {
  noteId: string;
  title: string;
  content: string;
  reportType: string;
  metadata: any;
}

export class ReportGenerationService {
  private reportGraph: ReportGraph;
  private titleGenerator: TitleGeneratorService;

  constructor() {
    this.reportGraph = new ReportGraph(
      env.TOGETHER_AI_API_KEY,
      env.TOGETHER_AI_MODEL,
      parseInt(env.REPORT_MAX_TOKENS, 10)
    );
    this.titleGenerator = new TitleGeneratorService(env.TOGETHER_AI_API_KEY, env.TOGETHER_AI_MODEL);
  }

  async generateReport(params: ReportGenerationParams): Promise<ReportResult> {
    const { documentIds, reportType, customPrompt, onStatusUpdate } = params;

    try {
      // Update status
      onStatusUpdate?.('generating');

      // Fetch chunks from selected documents
      const chunks = await this.fetchChunks(documentIds);

      if (chunks.length === 0) {
        throw new Error('No content found in selected documents');
      }

      console.log(
        `[ReportGeneration] Processing ${chunks.length} chunks for ${reportType} report`
      );

      // Build and invoke graph
      const graph = this.reportGraph.buildGraph();
      const result = await graph.invoke({
        documentIds,
        chunks,
        reportType,
        customPrompt,
        mapOutputs: [],
        collapsedOutputs: [],
        finalOutput: '',
        status: 'generating',
      }) as unknown as OverallStateType;

      console.log(
        `[ReportGeneration] Report generation completed. Status: ${result.status}`
      );

      return {
        content: result.finalOutput || '',
        metadata: {
          reportType,
          documentIds,
          chunksProcessed: chunks.length,
        },
      };
    } catch (error) {
      console.error('[ReportGeneration] Error generating report:', error);
      throw error;
    }
  }

  async fetchChunks(documentIds: string[]): Promise<string[]> {
    try {
      console.log(`[ReportGeneration] Fetching chunks for documents: ${documentIds.join(', ')}`);

      const { data, error } = await supabase
        .from('document_chunks')
        .select('content, document_id, chunk_index')
        .in('document_id', documentIds)
        .order('chunk_index', { ascending: true });

      if (error) {
        console.error('[ReportGeneration] Error fetching chunks:', error);
        throw new Error(`Failed to fetch chunks: ${error.message}`);
      }

      const chunks = data?.map((d) => d.content) || [];
      console.log(`[ReportGeneration] Fetched ${chunks.length} chunks`);

      // Debug: Log first chunk preview to verify content
      if (chunks.length > 0) {
        const firstChunkPreview = chunks[0]?.substring(0, 200) || 'EMPTY';
        console.log(`[ReportGeneration] First chunk preview (${chunks[0]?.length || 0} chars): ${firstChunkPreview}...`);
      } else {
        console.warn('[ReportGeneration] WARNING: No chunks found!');
      }

      // Check for empty chunks
      const emptyChunks = chunks.filter(c => !c || c.trim().length === 0);
      if (emptyChunks.length > 0) {
        console.warn(`[ReportGeneration] WARNING: ${emptyChunks.length} empty chunks found!`);
      }

      return chunks;
    } catch (error) {
      console.error('[ReportGeneration] Error in fetchChunks:', error);
      throw error;
    }
  }

  async saveReport(params: SaveReportParams): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: params.title,
          content: params.content,
          status: 'completed',
          metadata: params.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.noteId);

      if (error) {
        console.error('[ReportGeneration] Error saving report:', error);
        throw new Error(`Failed to save report: ${error.message}`);
      }

      console.log(`[ReportGeneration] Report saved to note ${params.noteId}`);
    } catch (error) {
      console.error('[ReportGeneration] Error in saveReport:', error);
      throw error;
    }
  }

  async updateReportStatus(
    noteId: string,
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
        .from('notes')
        .update(updateData)
        .eq('id', noteId);

      if (error) {
        console.error('[ReportGeneration] Error updating status:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }
    } catch (error) {
      console.error('[ReportGeneration] Error in updateReportStatus:', error);
      throw error;
    }
  }

  getReportTitle(reportType: string): string {
    const titles: Record<string, string> = {
      briefing: 'Briefing Document',
      study_guide: 'Study Guide',
      blog_post: 'Blog Post',
      summary: 'Summary',
      technical_report: 'Technical Report',
      concept_explainer: 'Concept Explainer',
      methodology_overview: 'Methodology Overview',
      custom: 'Custom Report',
    };
    return titles[reportType] || 'Report';
  }

  getPreviewText(reportType: string, status: string): string {
    if (status === 'generating' || status === 'mapping' || status === 'collapsing' || status === 'reducing') {
      return 'Report • Generating...';
    }
    if (status === 'failed') {
      return 'Report • Failed';
    }
    return `Report • ${this.getReportTitle(reportType)}`;
  }

  /**
   * Generate an AI-powered title from report content
   * Uses the first part of the content (up to ~500 chars) to generate a descriptive title
   */
  async generateTitleFromContent(content: string): Promise<string> {
    try {
      // Take first ~500 characters for title generation
      const contentChunk = content.substring(0, 500);
      const title = await this.titleGenerator.generateTitle(contentChunk);
      console.log(`[ReportGeneration] Generated title: ${title}`);
      return title;
    } catch (error) {
      console.error('[ReportGeneration] Error generating title from content:', error);
      // Fallback to a default title if generation fails
      return 'Report';
    }
  }

  /**
   * Generate a fallback title from source chunks (when content is empty)
   */
  async generateTitleFromChunks(chunks: string[], reportType: string): Promise<string> {
    try {
      // Use the first chunk for title generation
      const title = await this.titleGenerator.generateTitle(chunks[0] || 'No content');
      console.log(`[ReportGeneration] Generated title from chunks: ${title}`);
      return title;
    } catch (error) {
      console.error('[ReportGeneration] Error generating title from chunks:', error);
      // Fallback to default title if generation fails
      return this.getReportTitle(reportType);
    }
  }
}
