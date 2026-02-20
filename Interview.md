# DocuPilot: Interview Preparation Guide

This document is your comprehensive guide to understanding and explaining the DocuPilot project. It's designed to prepare you for a technical interview, covering the project's purpose, architecture, tech stack, and code flow.

---

### 1. The Elevator Pitch: What is DocuPilot?

**Interviewer:** "So, tell me about this project, DocuPilot."

**Your Answer:** "DocuPilot is an intelligent document assistant designed to help users quickly understand and manage their text-based documents. It's a full-stack web application where users can upload or paste text, and the app uses Generative AI to provide valuable insights. Key features include automatically generating concise summaries, extracting a to-do list of action items, and allowing users to have an interactive conversation with their documents through a chat interface."

---

### 2. Core Features

-   **Secure Authentication**: Users can sign up and log in with email/password or their Google account. This is handled by Firebase Authentication.
-   **Document Management**: Users can upload `.txt` files or paste raw text. The document content and its metadata (name, creation date, etc.) are stored securely in Firestore.
-   **AI-Powered Analysis**:
    -   **Summarization**: When a document is uploaded, an AI flow generates a concise summary.
    -   **Action Item Extraction**: The AI also analyzes the document to identify and list out actionable tasks.
-   **Chat with Documents (RAG)**: Users can select a document and ask questions about its content. The AI provides answers based *only* on the information in that document.
-   **Task Management**: Extracted action items are collected on a dedicated "Tasks" page.

---

### 3. The Tech Stack

DocuPilot is built with a modern, serverless, and AI-centric tech stack:

-   **Framework**: **Next.js 15** (using the App Router).
-   **Language**: **TypeScript**.
-   **UI & Styling**: **React**, **ShadCN UI**, and **Tailwind CSS**.
-   **Backend & Database**: **Firebase (Firestore & Auth)**.
-   **Generative AI**: **Google Gemini** via **Genkit**.
-   **Infrastructure (Target Architecture)**: **AWS (ECS, Fargate, ALB, CloudFront)**.

---

### 4. Architectural Deep Dive: How It All Works

#### The RAG Pattern (Chat with Documents)
1.  **Chunking**: The document is broken into smaller chunks.
2.  **Embedding**: Each chunk and the user's question are converted into vector embeddings.
3.  **Similarity Search**: We find chunks semantically similar to the question using dot-product calculation.
4.  **Augmented Prompt**: Relevant chunks are combined with the question for the Gemini model.
5.  **Generation**: Gemini generates an answer grounded *only* in the provided context.

---

### 5. Enterprise AWS Architecture (For Amazon SDE Interview)

**Interviewer:** "As an AWS Certified Solutions Architect, how did you design this for Amazon-scale production?"

**Your Answer:** "To move DocuPilot into a production-grade AWS environment, I followed the **AWS Well-Architected Framework** with this enterprise-grade stack:"

1.  **Compute: Amazon ECS with AWS Fargate**:
    -   **Why**: I containerized the Next.js app using a multi-stage **Dockerfile**. Deploying to ECS Fargate provides a serverless container experience, eliminating server management while ensuring the app scales horizontally based on traffic.

2.  **Traffic Management: Application Load Balancer (ALB)**:
    -   **Why**: I configured an ALB to distribute traffic across Fargate tasks in multiple **Availability Zones (AZs)**. This ensures high availability and fault tolerance.

3.  **Content Delivery: Amazon CloudFront**:
    -   **Why**: I used CloudFront as a CDN to cache static assets at Edge Locations, reducing latency globally and protecting the origin with **AWS WAF**.

4.  **Configuration: AWS Secrets Manager**:
    -   **Why**: Instead of using `.env` files, I integrated the app with AWS Secrets Manager to securely fetch Firebase and Gemini credentials at runtime.

5.  **CI/CD: AWS CodePipeline & CodeBuild**:
    -   **Why**: I implemented a full CI/CD pipeline using the included `buildspec.yml`. Every commit triggers a build that pushes an image to **Amazon ECR** and performs a rolling update to the ECS service.

**Resume Summary**: "Architected a scalable, high-availability deployment for DocuPilot using **Amazon ECS (Fargate)**, **ALB**, and **CloudFront**. Automated the production release cycle using **AWS CodePipeline** and **CodeBuild**, ensuring enterprise-grade security via **AWS Secrets Manager**."

---

### 6. Key Decisions & Trade-offs
-   **Standalone Output**: I enabled `output: 'standalone'` in Next.js to optimize the Docker image size for AWS deployment.
-   **Multi-Stage Dockerfile**: This ensures the final production image is lean (only ~100MB) by stripping out dev dependencies and build tools.
