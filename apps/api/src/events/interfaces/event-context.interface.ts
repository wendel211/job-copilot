export interface EventContext {
  userId?: string;
  jobId?: string;
  draftId?: string;
  providerId?: string;
  sendId?: string;
  metadata?: Record<string, any>;
}
