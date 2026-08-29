export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export type DocumentStatus = 'UPLOADING' | 'PROCESSING' | 'INDEXING' | 'READY' | 'FAILED';

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  file_size_bytes: number;
  file_type: string;
  total_pages: number;
  total_chunks: number;
  status: DocumentStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  chunk_index: number;
  page_number: number;
  content: string;
  token_count: number;
  created_at: string;
}

export interface CitationItem {
  document_id: string;
  document_title: string;
  page_number: number;
  chunk_id?: string;
  snippet: string;
  similarity_score: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationItem[];
  tokens_used?: { prompt_tokens: number; completion_tokens: number };
  latency_ms?: { retrieval_ms: number; generation_ms: number };
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  document_id?: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  messages?: Message[];
}

export interface SummaryData {
  id: string;
  document_id: string;
  title: string;
  quick_summary: string;
  detailed_summary: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface QuizData {
  id: string;
  document_id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  total_questions: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizResult {
  quiz_id: string;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  feedback: string;
  details: {
    question_id: number;
    question: string;
    options: string[];
    selected_option: number;
    correct_option: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

export interface Flashcard {
  id: string;
  document_id: string;
  front: string;
  back: string;
  category: string;
  difficulty: string;
  created_at: string;
}

export interface RAGMetricItem {
  id: string;
  query: string;
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  top_k_chunks: number;
  avg_similarity_score: number;
  prompt_tokens: number;
  completion_tokens: number;
  model_name: string;
  status: string;
  created_at: string;
}

export interface MetricsSummary {
  total_queries: number;
  avg_total_latency_ms: number;
  avg_retrieval_latency_ms: number;
  avg_generation_latency_ms: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  success_rate_percentage: number;
  total_documents: number;
  total_chunks: number;
  recent_metrics: RAGMetricItem[];
}
