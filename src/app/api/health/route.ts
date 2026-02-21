
import { NextResponse } from 'next/server';

/**
 * @fileOverview Health check endpoint for AWS Application Load Balancer (ALB).
 * Essential for the ALB to verify that the containerized Next.js app is healthy.
 */

export async function GET() {
  return NextResponse.json(
    { 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      service: 'DocuPilot-Web'
    },
    { status: 200 }
  );
}
