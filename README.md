# DocuPilot - Your Intelligent Document Assistant

DocuPilot is a modern web application designed to help you manage and understand your documents intelligently. Built with Next.js, Firebase, and Google's Gemini AI, it provides a seamless experience for uploading documents, extracting key information, and chatting with your content in a conversational way.

## Features

- **Secure Authentication**: Sign up and log in using email/password or a Google account, powered by Firebase Authentication.
- **Document Management**: Upload `.txt` files or paste text content directly into the app. Your documents are stored securely in Firestore.
- **AI-Powered Insights**:
  - **Summarization**: Automatically generate concise summaries of your documents.
  - **Action Item Extraction**: AI identifies and creates a to-do list of actionable tasks from your text.
- **Interactive Chat (RAG)**: Engage in a conversation with your documents. Ask questions and get answers with citations pointing back to the source text.
- **Task Management**: View all your extracted action items on a dedicated Tasks page, mark them as complete, and easily trace them back to their source document.
- **Responsive UI**: A clean, modern, and responsive interface built with ShadCN UI and Tailwind CSS.

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

---

## Deployment to Vercel

This Next.js app is optimized for deployment on [Vercel](https://vercel.com/).

1. **Push your code to a Git repository** (e.g., GitHub, GitLab).

2. **Create a new Vercel project:**
   - Go to your Vercel dashboard and click "Add New... > Project".
   - Import your Git repository.

3. **Configure Environment Variables:**
   - In your Vercel project settings, navigate to the "Environment Variables" section.
   - Add all the variables from your `.env.local` file (the Firebase and Gemini keys). These are essential for your deployed application to connect to the backend services.

4. **Deploy:**
   - Vercel will automatically detect that you're deploying a Next.js application and will configure the build settings for you.
   - Click the "Deploy" button. Vercel will build and deploy your site.

After a few moments, your DocuPilot application will be live!
