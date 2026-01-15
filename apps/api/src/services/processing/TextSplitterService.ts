import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { encoding_for_model } from 'tiktoken';

export class TextSplitterService {
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    // Use cl100k_base encoding (GPT-4/o1) for token counting
    const encoding = encoding_for_model('gpt-4o');
    const tokenizer = (text: string) => encoding.encode(text).length;

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 50,
      separators: ['\n\n', '\n', '. ', ' ', ''],
      lengthFunction: tokenizer,
    });
  }

  async splitText(text: string): Promise<string[]> {
    try {
      return await this.splitter.splitText(text);
    } catch (error) {
      console.error('Text splitter error:', error);
      throw new Error('Failed to split text');
    }
  }
}
