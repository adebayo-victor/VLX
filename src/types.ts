/**
 * Types representing the data models for the VLX Tools full-stack application.
 */

export interface FeedbackRecord {
  id: number;
  academic_year: string;
  location: string;
  problem_description: string;
  solution_suggestion: string;
  timestamp: string;
}

export interface AnonymousMessage {
  id: number;
  content: string;
  phoneNumber?: string | null;
  timestamp: string;
}

export interface GeneratedDocument {
  key: string;
  subkey: number;
  title: string;
  template: string;
  timestamp: string;
}

export type DocumentType =
  | 'letter'
  | 'agreement'
  | 'memo'
  | 'receipt'
  | 'report'
  | 'proposal'
  | 'certificate'
  | 'list';

export interface DocumentFormData {
  // Common
  document_type: DocumentType;

  // Letter / Memo fields
  letter_sender_address?: string;
  letter_receiver_address?: string;
  letter_receiver_gender?: string;
  letter_title?: string;
  letter_body_prompt?: string;
  letter_sender_name?: string;
  letter_position?: string;

  memo_sender_address?: string;
  memo_receiver_address?: string;
  memo_receiver_gender?: string;
  memo_title?: string;
  memo_body_prompt?: string;
  memo_sender_name?: string;
  memo_position?: string;

  // Agreement fields
  agreement_parties_info?: string;
  agreement_date?: string;
  agreement_terms?: string;

  // Receipt fields
  receipt_payer_name?: string;
  receipt_receiver_name?: string;
  receipt_amount_paid?: string;
  receipt_payment_method?: string;
  receipt_description?: string;

  // Report fields
  report_report_title?: string;
  report_report_author?: string;
  report_report_topic?: string;
  report_submission_date?: string;
  report_report_body?: string;

  // Proposal fields
  proposal_proposal_title?: string;
  proposal_proposer_info?: string;
  proposal_recipient_info_1?: string;
  proposal_recipient_info_2?: string;
  proposal_problem?: string;
  proposal_solution?: string;
  proposal_budget?: string;

  // Certificate fields
  certificate_certificate_type?: string;
  certificate_recipient_name?: string;
  certificate_certificate_reason?: string;
  certificate_issue_date?: string;
  certificate_issuer_name?: string;
  certificate_issuer_title?: string;

  // List fields
  list_prompt?: string;
  list_data?: string;
}
