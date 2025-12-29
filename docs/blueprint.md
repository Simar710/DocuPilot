# **App Name**: DocuPilot

## Core Features:

- Authentication: Secure user authentication via email/password and Google sign-in using Firebase Auth, routing to the /dashboard upon successful login.
- Document Upload & Indexing: Prioritize TXT upload + a “Paste Text” input on the /docs page. PDF upload can remain, but show a message: “For best results upload TXT or paste text.” A Cloud Function is triggered to extract text (TXT MVP), chunk it, generate embeddings, and store the chunks in Firestore. Limit each user to ~200–500 chunks.
- Semantic Search: Cloud Function to perform vector search. Creates an embedding for the query and calculates cosine similarity against stored chunk embeddings (stored in Firestore) to return the topK chunks with metadata. README note: for production scale, replace with a vector DB (pgvector/Pinecone/etc).
- RAG Chat with Citations: Chat interface on /chat that uses searchDocs to retrieve relevant chunks, constructs a prompt, and returns an answer with citations. It should return only from the provided context. Stores conversations in Firestore.
- Agent Mode with Tool Calling: Agent mode in /chat enables multi-step reasoning using the searchDocs and createTask tools in a deterministic multi-step pipeline: searchDocs(query) -> generateBriefing(retrievedChunks) -> extractActionItems(briefing) -> createTask() writes to Firestore. This should not be “autonomous”; it should be a controlled workflow with tool calls.
- Task Management: Create and track personal tasks derived from document analysis; tasks are private to the signed-in user, leveraging Firestore for persistent storage and real-time updates. Task management is personal tasks only (no collaboration/assignment).
- Dashboard: The /dashboard displays recent conversations, uploaded documents, open tasks, and basic metrics (chat latency, top cited documents).

## Style Guidelines:

- Primary color: Deep sky blue (#4169E1), offering a sense of trust and intelligence.
- Background color: Very light blue (#F0F8FF), for a clean, unobtrusive background.
- Accent color: Lavender (#E6E6FA), used sparingly to highlight interactive elements and important information.
- Body and headline font: 'Inter' for a modern, machined and neutral look. It offers excellent readability and a professional feel, well-suited for both headlines and body text.
- Use a set of consistent, simple icons (e.g., Material Design icons) for common actions and document types.
- Employ a clean, card-based layout for the dashboard and document/task listings to ensure a focused user experience.
- Use subtle loading animations and transitions to provide feedback and maintain a smooth user experience during data ingestion, search, and chat interactions.