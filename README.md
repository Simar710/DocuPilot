# DocuPilot - Your Intelligent Document Assistant [Link](https://docu-pilot-flax.vercel.app/login)

DocuPilot is a modern web application designed to help you manage and understand your documents intelligently. Built with Next.js, Firebase, and Google's Gemini AI, it provides a seamless experience for uploading documents, extracting key information, and chatting with your content in a conversational way.

## Features

- **Secure Authentication**: Sign up and log in using email/password or a Google account, powered by Firebase Authentication.
- **Document Management**: Upload `.txt` files or paste text content directly into the app. Your documents are stored securely in Firestore.
  - **Note on Limits**: To ensure optimal performance, the following limits are in place:
    - **Max Documents**: 10 per user.
    - **File Uploads**: Up to 1 MB per `.txt` file, with a content limit of 200,000 characters.
    - **Pasted Text**: Up to 100,000 characters.
- **AI-Powered Insights**:
  - **Summarization**: Automatically generate concise summaries of your documents.
  - **Action Item Extraction**: AI identifies and creates a to-do list of actionable tasks from your text.
- **Interactive Chat (RAG)**: Engage in a conversation with your documents. Ask questions and get answers with citations pointing back to the source text. User questions are limited to 4,000 characters.
- **Task Management**: View all your extracted action items on a dedicated Tasks page, mark them as complete, and easily trace them back to their source document.
- **Responsive UI**: A clean, modern, and responsive interface built with ShadCN UI and Tailwind CSS.

## How It Works: AI & RAG

This project leverages the power of Large Language Models (LLMs) through a combination of direct prompting and a Retrieval-Augmented Generation (RAG) pattern.

### Transformer Models (Gemini)
At its core, DocuPilot uses **Google's Gemini**, a powerful, multimodal **transformer** model. Transformer architecture allows the model to weigh the importance of different words in a document, giving it a sophisticated understanding of context, nuance, and relationships in the text. This is used for:
- **Summarization**: The model reads the entire document content and generates a concise summary.
- **Action Item Extraction**: The model analyzes the text to identify and list out clear, actionable tasks.

### Retrieval-Augmented Generation (RAG)
For the interactive **Chat** feature, DocuPilot implements a RAG pattern. This is a powerful technique that makes the AI "knowledge-aware" of a specific document without needing to re-train the model. Here's the process:

1.  **Chunking & Embedding**: When you start a chat, the source document is broken down into smaller, overlapping text "chunks". Each chunk is then converted into a numerical representation called a **vector embedding**. This embedding captures the semantic meaning of the text.
2.  **User Question**: Your question is also converted into a vector embedding using the same model.
3.  **Similarity Search**: The application performs a similarity search (in this case, a simple dot-product calculation) to find the text chunks from the document whose embeddings are most similar to your question's embedding. These are the "most relevant" pieces of information.
4.  **Augmented Prompt**: The most relevant text chunks are then combined with your original question into a new, "augmented" prompt that is sent to the Gemini model.
5.  **Generation**: The model generates an answer based *only* on the context provided by those relevant chunks. This prevents the model from hallucinating or using outside knowledge, grounding its response firmly in the document's content. The retrieved chunks are also returned as "sources" or "citations" in the UI.

This RAG approach allows you to have a detailed, in-context conversation with your private documents efficiently and accurately.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Generative AI**: [Google's Gemini model](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Deployment**: Ready for [Vercel](https://vercel.com/)

---

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or newer recommended)
- A Google account for Firebase

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/docupilot.git
   cd docupilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   This project is configured to work with Firebase. The necessary configuration files are already in the project, but they need to be populated with your specific Firebase project keys.

4. **Set up Environment Variables:**
   Create a `.env.local` file in the root of your project. This file will hold your Firebase API keys. The application is set up to automatically populate this, but if you need to do it manually, you can get the values from your Firebase project settings.

   ```.env.local
   NEXT_PUBLIC_FIREBASE_API_KEY=AIz...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:...
   ```
   
   You will also need a Google AI API key for the Genkit flows. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
   
   ```.env.local
   # Add this to your .env.local
   GEMINI_API_KEY=your-gemini-api-key
   ```


5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application should now be running at `http://localhost:3000`.
