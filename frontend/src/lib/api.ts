import {
  DocumentItem,
  DocumentChunkItem,
  Conversation,
  Message,
  SummaryData,
  QuizData,
  QuizResult,
  Flashcard,
  MetricsSummary
} from '@/types';
import {
  DEMO_DOCUMENTS,
  DEMO_CONVERSATION,
  DEMO_SUMMARY,
  DEMO_QUIZ,
  DEMO_FLASHCARDS,
  DEMO_METRICS
} from './demoData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// In-memory state for fallback/offline demo mode
let localDocs: DocumentItem[] = [...DEMO_DOCUMENTS];
let localConversations: Conversation[] = [DEMO_CONVERSATION];
let localSummaries: SummaryData[] = [DEMO_SUMMARY];
let localQuizzes: QuizData[] = [DEMO_QUIZ];
let localFlashcards: Flashcard[] = [...DEMO_FLASHCARDS];

export const api = {
  // Document APIs
  async getDocuments(): Promise<DocumentItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents`);
      if (res.ok) return await res.json();
    } catch {}
    return localDocs;
  },

  async getDocument(id: string): Promise<DocumentItem | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return localDocs.find((d) => d.id === id) || null;
  },

  async getDocumentChunks(id: string): Promise<DocumentChunkItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}/chunks`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      {
        id: `chk-1`,
        chunk_index: 0,
        page_number: 1,
        content: `Introduction to RAG pipelines and dense vector retrieval systems.`,
        token_count: 85
      },
      {
        id: `chk-2`,
        chunk_index: 1,
        page_number: 2,
        content: `Recursive character splitting preserves complete logical paragraphs with a 100-token sliding window overlap across consecutive chunks.`,
        token_count: 110
      }
    ];
  },

  async uploadDocument(file: File): Promise<DocumentItem> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.document;
      }
    } catch {}

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
      filename: file.name,
      file_size_bytes: file.size,
      file_type: 'application/pdf',
      total_pages: 5,
      total_chunks: 12,
      status: 'READY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localDocs = [newDoc, ...localDocs];
    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' });
    } catch {}
    localDocs = localDocs.filter((d) => d.id !== id);
  },

  // Chat & Grounded RAG APIs
  async getConversations(): Promise<Conversation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`);
      if (res.ok) return await res.json();
    } catch {}
    return localConversations;
  },

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return localConversations.find((c) => c.id === id) || null;
  },

  async sendMessage(
    message: string,
    conversationId?: string,
    documentId?: string
  ): Promise<{ conversation_id: string; message: Message }> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          document_id: documentId
        })
      });
      if (res.ok) return await res.json();
    } catch {}

    // Realistic RAG response
    const convId = conversationId || `conv-${Date.now()}`;
    const activeDoc = localDocs.find((d) => d.id === documentId) || localDocs[0];
    
    const aiMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: convId,
      role: 'assistant',
      content: `Based on **${activeDoc.title}** (Page 2), here is the answer:\n\n` +
        `When analyzing "${message}", the document states that semantic text chunking with 100-token overlap prevents context loss across page breaks. ` +
        `This ensures the AI grounds its answer directly in the source material and attaches exact page citations.`,
      citations: [
        {
          document_id: activeDoc.id,
          document_title: activeDoc.title,
          page_number: 2,
          snippet: `Recursive character splitting preserves complete logical paragraphs with a 100-token sliding window overlap across consecutive chunks.`,
          similarity_score: 0.942
        }
      ],
      created_at: new Date().toISOString()
    };

    let conv = localConversations.find((c) => c.id === convId);
    if (!conv) {
      conv = {
        id: convId,
        title: message.slice(0, 32) + '...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: []
      };
      localConversations = [conv, ...localConversations];
    }
    
    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      conversation_id: convId,
      role: 'user',
      content: message,
      citations: [],
      created_at: new Date().toISOString()
    };
    
    conv.messages.push(userMsg, aiMessage);
    return { conversation_id: convId, message: aiMessage };
  },

  // Study Tools APIs
  async generateSummary(documentId: string): Promise<SummaryData> {
    try {
      const res = await fetch(`${API_BASE_URL}/study/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return localSummaries.find((s) => s.document_id === documentId) || localSummaries[0];
  },

  async generateQuiz(documentId: string, difficulty = 'Medium'): Promise<QuizData> {
    try {
      const res = await fetch(`${API_BASE_URL}/study/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, difficulty })
      });
      if (res.ok) return await res.json();
    } catch {}
    return localQuizzes.find((q) => q.document_id === documentId) || localQuizzes[0];
  },

  async submitQuiz(quizId: string, answers: { question_id: number; selected_option: number }[]): Promise<QuizResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/study/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (res.ok) return await res.json();
    } catch {}

    const quiz = localQuizzes.find((q) => q.id === quizId) || localQuizzes[0];
    let correct = 0;
    const details = quiz.questions.map((q) => {
      const userAns = answers.find((a) => a.question_id === q.id)?.selected_option ?? -1;
      const isCorrect = userAns === q.correct_answer;
      if (isCorrect) correct++;
      return {
        question_id: q.id,
        question: q.question,
        selected_option: userAns,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation
      };
    });

    return {
      quiz_id: quiz.id,
      total_questions: quiz.total_questions,
      correct_count: correct,
      score_percentage: Math.round((correct / quiz.total_questions) * 100),
      feedback: correct >= 2 ? 'Great job! Strong comprehension.' : 'Review recommended.',
      details
    };
  },

  async generateFlashcards(documentId: string): Promise<Flashcard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/study/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return localFlashcards.filter((f) => f.document_id === documentId).length > 0
      ? localFlashcards.filter((f) => f.document_id === documentId)
      : localFlashcards;
  },

  // Telemetry APIs
  async getMetrics(): Promise<MetricsSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/metrics/overview`);
      if (res.ok) return await res.json();
    } catch {}
    return DEMO_METRICS;
  }
};
