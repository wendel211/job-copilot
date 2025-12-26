export enum EventType {
  
  JOB_IMPORTED = "job_imported",


  PIPELINE_ITEM_CREATED = "pipeline_item_created",
  PIPELINE_STATUS_CHANGED = "pipeline_status_changed",
  PIPELINE_NOTE_ADDED = "pipeline_note_added",


  EMAIL_DRAFT_CREATED = "email_draft_created",
  EMAIL_DRAFT_OPENED = "email_draft_opened",
  EMAIL_DRAFT_UPDATED = "email_draft_updated",
  EMAIL_DRAFT_CHECKLIST_TOGGLED = "email_draft_checklist_toggled",



  EMAIL_SENT = "email_sent",
  EMAIL_FAILED = "email_failed",


  EMAIL_PROVIDER_TESTED = "email_provider_tested",
}
