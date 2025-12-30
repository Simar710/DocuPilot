'use server';
/**
 * @fileOverview A flow for chatting with a document using a RAG pattern.
 *
 * - chatWithDocument - A function that handles the chat process.
 * - ChatWithDocumentInput - The input type for the chatWithDocument function.
 * - ChatWithDocumentOutput - The return type for the chatWithDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Helper to chunk text
function chunkText(text: string, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

const ChatWithDocumentInputSchema = z.object({
  question: z.string().describe('The question the user is asking.'),
  documentText: z.string().describe('The full text content of the document.'),
});
export type ChatWithDocumentInput = z.infer<typeof ChatWithDocumentInputSchema>;

const ChatWithDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the document.'),
  citations: z.array(z.object({
    startIndex: z.number(),
    endIndex: z.number(),
    text: z.string(),
  })).describe('Citations from the source document that support the answer.'),
});
export type ChatWithDocumentOutput = z.infer<typeof ChatWithDocumentOutputSchema>;

export async function chatWithDocument(input: ChatWithDocumentInput): Promise<ChatWithDocumentOutput> {
  return chatWithDocumentFlow(input);
}

const chatWithDocumentFlow = ai.defineFlow(
  {
    name: 'chatWithDocumentFlow',
    inputSchema: ChatWithDocumentInputSchema,
    outputSchema: ChatWithDocumentOutputSchema,
  },
  async ({ question, documentText }) => {
    const textChunks = chunkText(documentText);
    const embeddings = await ai.embedMany({
        embedder: 'googleai/text-embedding-004',
        content: textChunks,
    });
    
    const questionEmbedding = await ai.embed({
        embedder: 'googleai/text-embedding-004',
        content: question,
    });

    // Super simple similarity search
    const similarities = embeddings.map((vector, index) => {
        let dotProduct = 0;
        for(let i = 0; i < vector.length; i++) {
            dotProduct += vector[i] * questionEmbedding[i];
        }
        return { index, score: dotProduct };
    });

    similarities.sort((a, b) => b.score - a.score);

    const topK = 5;
    const relevantChunks = similarities.slice(0, topK).map(item => textChunks[item.index]);

    const context = relevantChunks.join('\n\n---\n\n');

    const { output } = await ai.generate({
      prompt: `You are an expert document analyst. Answer the user's question based *only* on the provided context from the document.
      
      CONTEXT:
      ---
      ${context}
      ---
      
      QUESTION: ${question}
      
      ANSWER:`,
      output: {
        schema: z.object({
          answer: z.string(),
        })
      }
    });

    // For simplicity, we'll just return the answer without real citations for now.
    // A real implementation would map the answer back to the source chunks.
    return {
      answer: output?.answer || "I could not find an answer in the document.",
      citations: relevantChunks.map(chunk => ({ 
          text: chunk, 
          startIndex: documentText.indexOf(chunk),
          endIndex: documentText.indexOf(chunk) + chunk.length 
        })),
    };
  }
);
