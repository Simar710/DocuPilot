import { config } from 'dotenv';
config();

import '@/ai/flows/generate-document-summary.ts';
import '@/ai/flows/extract-action-items-from-document.ts';
import '@/ai/flows/chat-with-document.ts';
