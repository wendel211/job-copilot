import { SavedJobStatus } from "@prisma/client";

export interface PipelineItem {
  id: string;
  userId: string;
  jobId: string;
  status: SavedJobStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  job?: {
    id: string;
    title: string;
    companyId: string;
    location?: string | null;
    remote: boolean;
    applyUrl: string;
  };

  events?: Array<{
    id: string;
    type: string;
    createdAt: Date;
    metadata?: Record<string, any>;
  }>;
}
