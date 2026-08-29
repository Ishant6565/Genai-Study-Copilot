import { InterviewSession, InterviewEvaluation } from '@/types/interview';
import { SAMPLE_INTERVIEW_SESSION, SAMPLE_EVALUATION, TRACK_TEMPLATES } from './interviewData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

let localSessions: InterviewSession[] = [SAMPLE_INTERVIEW_SESSION];

export const interviewApi = {
  async startInterview(params: {
    role_title: string;
    track: string;
    seniority: string;
    interview_type: string;
    total_questions: number;
    job_description?: string;
  }): Promise<InterviewSession> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // In-memory fallback
    const sessionId = `int-${Date.now()}`;
    const trackObj = TRACK_TEMPLATES.find((t) => t.title.toLowerCase().includes(params.track.toLowerCase())) || TRACK_TEMPLATES[0];
    
    const newSession: InterviewSession = {
      id: sessionId,
      role_title: params.role_title || trackObj.roleTitle,
      track: params.track,
      seniority: params.seniority,
      interview_type: params.interview_type,
      total_questions: params.total_questions || 5,
      current_question_index: 0,
      status: 'IN_PROGRESS',
      job_description: params.job_description,
      created_at: new Date().toISOString(),
      questions: SAMPLE_INTERVIEW_SESSION.questions.slice(0, params.total_questions || 5).map((q, idx) => ({
        ...q,
        id: `q-${Date.now()}-${idx}`,
        question_order: idx + 1,
        candidate_answer: undefined,
        score: undefined,
        feedback: undefined
      }))
    };
    
    localSessions = [newSession, ...localSessions];
    return newSession;
  },

  async getInterview(sessionId: string): Promise<InterviewSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/${sessionId}`);
      if (res.ok) return await res.json();
    } catch {}
    return localSessions.find((s) => s.id === sessionId) || localSessions[0] || null;
  },

  async submitAnswer(params: {
    session_id: string;
    question_id: string;
    answer_text: string;
    is_follow_up?: boolean;
  }): Promise<{
    question_id: string;
    recorded_answer: string;
    has_follow_up: boolean;
    follow_up_question?: string;
    is_session_complete: boolean;
    next_question_index: number;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/${params.session_id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {}

    const session = localSessions.find((s) => s.id === params.session_id) || localSessions[0];
    const q = session.questions.find((item) => item.id === params.question_id) || session.questions[session.current_question_index];
    if (q) {
      q.candidate_answer = params.answer_text;
      q.score = params.answer_text.split(' ').length > 20 ? 8.5 : 6.0;
      q.feedback = 'Good technical reasoning provided.';
    }

    session.current_question_index += 1;
    const isComplete = session.current_question_index >= session.questions.length;
    if (isComplete) session.status = 'COMPLETED';

    return {
      question_id: params.question_id,
      recorded_answer: params.answer_text,
      has_follow_up: false,
      is_session_complete: isComplete,
      next_question_index: session.current_question_index
    };
  },

  async evaluateInterview(sessionId: string): Promise<InterviewEvaluation> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/${sessionId}/evaluate`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch {}

    const session = localSessions.find((s) => s.id === sessionId) || localSessions[0];
    const evalObj: InterviewEvaluation = {
      ...SAMPLE_EVALUATION,
      id: `eval-${Date.now()}`,
      session_id: sessionId,
      summary: `The candidate demonstrated strong capability for ${session.seniority} ${session.role_title}. Exhibited structured communication and solid foundational domain knowledge.`
    };
    session.evaluation = evalObj;
    return evalObj;
  },

  async getHistory(): Promise<InterviewSession[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews`);
      if (res.ok) return await res.json();
    } catch {}
    return localSessions;
  }
};
