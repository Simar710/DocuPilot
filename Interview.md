
# DocuPilot: Interview Preparation Guide (AWS Certified Solutions Architect Edition)

This guide is optimized for a technical interview at **Amazon (AWS)** or for an **SDE** role requiring high cloud proficiency.

---

### 1. The Elevator Pitch
"DocuPilot is an enterprise-grade document assistant. It uses a **Decoupled Architecture** where raw data is stored in **Amazon S3**, metadata and real-time state are managed in **Firebase**, and **GenAI (Gemini)** provides document intelligence. It’s built for high availability using **ECS on EC2** and an **ALB**."

---

### 2. Core AWS Architecture (The "Solutions Architect" View)

**Interviewer:** "Explain your AWS design for this app."

**Your Answer:** "I followed the **AWS Well-Architected Framework** to ensure security, cost-efficiency, and reliability:"

1.  **Compute: ECS on EC2 (t3.micro)**:
    -   I used **Amazon ECS** to orchestrate my Next.js containers. Deploying on EC2 instances allowed me to leverage the **AWS Free Tier** while maintaining full control over the compute environment.
2.  **Traffic: Application Load Balancer (ALB)**:
    -   The ALB handles TLS termination and distributes traffic to the ECS service. I implemented a custom `/api/health` check endpoint so the ALB can perform **Health Checks** and replace unhealthy containers automatically.
3.  **Storage: Decoupled S3 Strategy**:
    -   Instead of storing files on the server's local disk (which is ephemeral and limited), I implemented **S3 Pre-signed URLs**. The client uploads directly to S3 (**bucket: docupilot-uploads**), reducing server load and ensuring the storage scales infinitely.
4.  **Security: IAM Roles & Secrets Manager**:
    -   I implemented **Least Privilege** by using the **DocuPilot-EC2-Role** instead of IAM User keys. The container fetches credentials automatically from the EC2 Instance Metadata Service. I also use **AWS Secrets Manager** to inject Gemini API keys and Firebase configs at runtime.
5.  **CDN: Amazon CloudFront**:
    -   I added CloudFront to cache static assets at Edge Locations, reducing latency globally and providing **AWS WAF** protection.

---

### 3. Implementation Details (Deep Dive)

#### **How direct-to-S3 upload works:**
1.  User selects a file in the browser.
2.  The client calls a **Next.js Server Action**.
3.  The server uses the **AWS SDK** (with the DocuPilot-EC2-Role permissions) to generate a **Pre-signed URL**.
4.  The client `PUT`s the file directly to S3 using that URL.
5.  The client then saves the S3 Key and metadata to **Firestore**.

#### **CI/CD Pipeline:**
"I used **AWS CodePipeline** and **CodeBuild**. The `buildspec.yml` builds the Docker image for the **linux/amd64** architecture, tags it, and pushes it to **Amazon ECR**. This triggers a rolling update in ECS, ensuring zero-downtime deployments."

---

### 4. Resume-Ready Bullet Points
- "Architected a scalable document assistant using **Amazon ECS on EC2** and **ALB**, implementing automated health checks and self-healing."
- "Optimized storage costs and performance by implementing **Direct-to-S3 uploads via Pre-signed URLs**, decoupling raw data from server logic."
- "Enhanced security posture by utilizing **IAM Instance Roles (DocuPilot-EC2-Role)** for S3 access and **AWS Secrets Manager** for credential management, eliminating long-lived access keys."
- "Automated production releases with a full **CI/CD pipeline** using **AWS CodeBuild** and **ECR**, targeting x86_64 container architectures."

---

### 5. Key Trade-offs
- **ECS on EC2 vs Fargate**: Chose EC2 to maximize the 12-month Free Tier benefits while still demonstrating container orchestration.
- **S3 vs Local Storage**: Decoupled storage is essential for **Stateless Containers**. Since ECS tasks can be replaced at any time, local storage would result in data loss.
