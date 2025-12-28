import { PromptTemplate } from '@langchain/core/prompts';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';

export class TitleGeneratorService {
  private llm: ChatTogetherAI;
  private promptTemplate: PromptTemplate;

  constructor(apiKey: string, model: string = 'meta-llama/Llama-3.2-3B-Instruct-Turbo') {
    this.llm = new ChatTogetherAI({
      apiKey,
      model,
      temperature: 0.3,
    });

    this.promptTemplate = PromptTemplate.fromTemplate(
      'Generate a concise, descriptive title (max 10 words) for this document chunk:\n\n{chunk}\n\nTitle:'
    );
  }

  async generateTitle(firstChunk: string): Promise<string> {
    try {
      const prompt = await this.promptTemplate.format({ chunk: firstChunk });
      const response = await this.llm.invoke(prompt);
      let title = response.content.toString().trim();
      // Remove quotation marks from the start and end of the title
      title = title.replace(/^["']|["']$/g, '');
      return title;
    } catch (error) {
      console.error('Title generator error:', error);
      throw new Error('Failed to generate title');
    }
  }
}
