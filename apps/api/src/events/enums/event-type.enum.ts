export enum EventType {
  JOB_IMPORTED = "job.imported",

  DRAFT_CREATED = "draft.created",
  DRAFT_UPDATED = "draft.updated",
  CHECKLIST_UPDATED = "draft.checklist.updated",

  EMAIL_SEND_QUEUED = "email.queued",
  EMAIL_SENT = "email.sent",
  EMAIL_FAILED = "email.failed",

  PROVIDER_TESTED = "provider.tested",
  PROVIDER_FAILED = "provider.failed",

  PIPELINE_STATUS_CHANGED = "pipeline.status.changed",
  PIPELINE_NOTE_ADDED = "pipeline.note.added"
}
