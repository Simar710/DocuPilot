# DocuPilot – Your Intelligent Document Assistant

## 🔗 [Live Application](http://docupilot-alb-2119150112.us-east-2.elb.amazonaws.com/login)

DocuPilot is a production-deployed intelligent document assistant built with **Next.js, Firebase, and Google Gemini AI**, running in a containerized AWS infrastructure using **Amazon ECS (EC2 launch type)**.

It allows users to securely upload documents, extract structured insights, and chat with their content using a Retrieval-Augmented Generation (RAG) pipeline.

---

# 🚀 Production Architecture (AWS Deployment)

DocuPilot is deployed using a containerized cloud-native stack on AWS.

## 🧱 Infrastructure Overview

```
Internet
   |
   v
Application Load Balancer (ALB)
   |
   v
Target Group (Port 3000)
   |
   v
EC2 Instance (ECS Cluster)
   |
   v
Docker Container (Next.js App)
   |
   v
Firebase + Gemini APIs
```

---

## 🐳 Containerization

The application is:

- Dockerized via a custom `Dockerfile`
- Built locally
- Pushed to **Amazon Elastic Container Registry (ECR)**

The Docker image is stored in:

> Amazon ECR (private container registry)

Each ECS deployment pulls the latest image from ECR.

---

## ☁️ Compute & Orchestration

### Amazon ECS (EC2 Launch Type)

The deployment uses:

- **ECS Cluster** → `docupilot-cluster`
- **Task Definition** → `docupilot-task`
- **Service** → `docupilot-service`

The ECS Service:

- Maintains one running task
- Automatically restarts failed containers
- Registers instances with the load balancer
- Handles rolling deployments

### EC2 Instance

- Launch type: EC2 (not Fargate)
- Joined to ECS cluster
- Runs Docker container
- Protected via security groups

---

## 🔐 Secrets & Security

### AWS Secrets Manager

All production secrets are securely stored:

- Firebase configuration keys
- Gemini API key

Secret path:

- docupilot/prod/secrets


Secrets are:

- Retrieved via `ecsTaskExecutionRole`
- Injected as environment variables at runtime
- Never stored in the Docker image

### IAM Roles

Two IAM roles are configured:

1. **EC2 Instance Role**
   - ECS cluster communication
   - ECR image pulls

2. **ECS Task Execution Role**
   - `secretsmanager:GetSecretValue`
   - `kms:Decrypt` (if required)

---

## 🌐 Networking & Load Balancing

### Application Load Balancer (ALB)

- Internet-facing
- Listener: Port 980 (HTTP)
- Routes traffic to ECS targets on port 3000

### Target Group

- Target type: Instance
- Protocol: HTTP
- Port: 3000
- Health checks enabled

### Security Groups

**ALB Security Group**
- Allows inbound 980 (or 80) from the internet

**EC2 Security Group**
- Allows inbound 3000 only from the ALB security group

Direct access to EC2 is blocked.

---

## 🔄 Deployment Flow

To deploy a new version:

1. Build Docker image
2. Push image to ECR
3. Create new Task Definition revision
4. Update ECS Service
5. Force new deployment

ECS performs:

- Rolling replacement
- Health validation
- Automatic target registration

---

# ✨ Features

## 🔐 Authentication

- Email/password login
- Google OAuth login
- Powered by Firebase Authentication
- Production ALB domain authorized in Firebase console

## 📄 Document Management

- Upload `.txt` files (up to 1MB)
- Paste text directly
- Firestore document storage

Limits:

- 10 documents per user
- 200,000 character file limit
- 100,000 character paste limit

## 🧠 AI-Powered Features

### 1. Summarization
Uses Gemini transformer model to generate structured summaries.

### 2. Action Item Extraction
Identifies actionable tasks from document content.

### 3. RAG Chat System
Users can:

- Ask contextual questions
- Receive grounded answers
- View source citations

---

# 🧠 AI & RAG Architecture

## Transformer Model (Gemini)

DocuPilot uses Google Gemini to:

- Understand semantic context
- Extract structured data
- Generate grounded responses

---

## Retrieval-Augmented Generation (RAG)

### Step 1 – Chunking
Documents are split into overlapping segments.

### Step 2 – Embedding
Each chunk is converted into vector embeddings.

### Step 3 – Similarity Search
User question embedding is compared against document embeddings using dot-product similarity.

### Step 4 – Prompt Augmentation
Top relevant chunks are injected into the model prompt.

### Step 5 – Grounded Generation
Gemini generates an answer strictly based on retrieved context.

This prevents hallucinations and ensures citations.

---

# 🧰 Tech Stack

## Frontend
- Next.js (App Router)
- Tailwind CSS
- ShadCN UI

## Backend Services
- Firebase Firestore
- Firebase Authentication
- Google Gemini via Genkit

## Cloud Infrastructure
- Amazon ECS (EC2 Launch Type)
- Amazon ECR
- Amazon EC2
- Application Load Balancer
- AWS Secrets Manager
- IAM Roles & Policies
- VPC + Subnets

---

# 🛠️ Local Development

## Prerequisites

- Node.js v18+
- Docker
- Firebase project
- Gemini API key

---

## Setup

```bash
git clone https://github.com/your-username/docupilot.git
cd docupilot
npm install
```

Create `.env.local`:

```env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
```

Run development server:
```bash
npm run dev
```

Application will be available at:
```bash
http://localhost:3000
```

---

## 🔒 Security Highlights

- Secrets managed via AWS Secrets Manager  
- IAM-based role permissions  
- No API keys committed to repository  
- ALB isolates public traffic  
- EC2 instances not directly exposed  

---

## 🎯 What This Project Demonstrates

- Containerized production deployment  
- ECS orchestration (EC2 launch type)  
- Load balancing & health checks  
- IAM-based secret injection  
- Secure OAuth production setup  
- Retrieval-Augmented Generation (RAG) system design  
- Cloud-native infrastructure architecture  

