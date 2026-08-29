import { InterviewSession, InterviewEvaluation } from '@/types/interview';
import { SAMPLE_INTERVIEW_SESSION, SAMPLE_EVALUATION, TRACK_TEMPLATES } from './interviewData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

let localSessions: InterviewSession[] = [SAMPLE_INTERVIEW_SESSION];

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been',
  'before', 'being', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'each', 'for',
  'from', 'had', 'has', 'have', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'more', 'most',
  'my', 'no', 'not', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'too', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your'
]);

function extractKeywords(text: string): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9_\-\+]/g, ' ').split(/\s+/);
  return new Set(words.filter((w) => w.length > 2 && !STOP_WORDS.has(w)));
}

function evaluateAnswerClient(questionText: string, idealAnswer: string, candidateAnswer: string): { score: number; feedback: string } {
  const cleanAns = candidateAnswer.trim();
  if (!cleanAns || cleanAns.length < 8) {
    return { score: 1.5, feedback: 'No substantial answer provided. Be sure to articulate your technical thoughts.' };
  }

  const lowered = cleanAns.toLowerCase();
  if (lowered.includes("i don't know") || lowered.includes('no idea') || lowered.includes('idk') || lowered.includes('not sure')) {
    return { score: 3.0, feedback: 'Candidate indicated unfamiliarity with the topic. Recommended to review foundational concepts.' };
  }

  const idealKeywords = extractKeywords(idealAnswer || questionText);
  const candidateKeywords = extractKeywords(candidateAnswer);

  const matched = Array.from(idealKeywords).filter((k) => candidateKeywords.has(k));
  const overlapRatio = idealKeywords.size > 0 ? matched.length / idealKeywords.size : 0.2;

  let score = 5.0;
  let feedback = '';

  if (overlapRatio >= 0.35) {
    score = Math.min(9.6, 8.5 + (overlapRatio - 0.35) * 3);
    const goodTerms = matched.slice(0, 3).join(', ');
    feedback = `Strong technical answer! Accurately covered core concepts including ${goodTerms || 'key architectural points'}. Clear articulation.`;
  } else if (overlapRatio >= 0.18) {
    score = 7.0 + (overlapRatio - 0.18) * 8.0;
    const goodTerms = matched.slice(0, 2).join(', ');
    const missing = Array.from(idealKeywords).filter((k) => !candidateKeywords.has(k)).slice(0, 2).join(', ');
    feedback = `Solid foundation covering ${goodTerms || 'main concepts'}. To elevate to staff level, also elaborate on ${missing || 'edge-case trade-offs'}.`;
  } else if (overlapRatio >= 0.08 || candidateAnswer.split(/\s+/).length >= 25) {
    score = Math.max(5.5, 5.0 + overlapRatio * 12);
    const missing = Array.from(idealKeywords).filter((k) => !candidateKeywords.has(k)).slice(0, 3).join(', ');
    feedback = `Partially answered, but missed critical architectural points such as ${missing || 'core implementation details'}.`;
  } else {
    score = 4.0;
    feedback = 'Response lacks key technical depth and domain vocabulary. Review the model answer for the recommended breakdown.';
  }

  return { score: Math.round(score * 10) / 10, feedback };
}

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
      const evaluation = evaluateAnswerClient(q.question_text, q.ideal_answer || '', params.answer_text);
      q.score = evaluation.score;
      q.feedback = evaluation.feedback;
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
    const scores = session.questions.map((q) => q.score).filter((s): s is number => typeof s === 'number');
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 7.5;
    const overallPct = Math.round(avg * 10 * 10) / 10;

    let verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Improvement' = 'Hire';
    if (overallPct >= 88) verdict = 'Strong Hire';
    else if (overallPct >= 74) verdict = 'Hire';
    else if (overallPct >= 60) verdict = 'Lean Hire';
    else verdict = 'Needs Improvement';

    const strengths: string[] = [];
    const growth: string[] = [];

    session.questions.forEach((q) => {
      if (q.score && q.score >= 8.0) {
        strengths.push(`Solid explanation of ${q.category} concepts.`);
      } else if (q.score && q.score < 7.0) {
        growth.push(`Deepen domain depth in ${q.category} (e.g. edge-cases & trade-offs).`);
      }
    });

    if (strengths.length === 0) {
      strengths.push('Demonstrated fundamental comprehension of core track concepts.');
      strengths.push('Attempted questions with structural communication.');
    }
    if (growth.length === 0) {
      growth.push('Include concrete production metrics (P99 latency, memory footprints).');
      growth.push('Discuss failover, zero-downtime, and race condition mitigations.');
    }

    const evalObj: InterviewEvaluation = {
      id: `eval-${Date.now()}`,
      session_id: sessionId,
      overall_score: overallPct,
      hiring_verdict: verdict,
      technical_depth_score: Math.min(10, Math.round((avg + 0.3) * 10) / 10),
      communication_score: Math.min(10, Math.round((avg + 0.4) * 10) / 10),
      problem_solving_score: Math.round(avg * 10) / 10,
      edge_case_score: Math.max(3.5, Math.round((avg - 0.5) * 10) / 10),
      strengths: strengths.slice(0, 3),
      areas_to_improve: growth.slice(0, 3),
      summary: `Candidate demonstrated ${verdict} level capability for ${session.seniority} ${session.role_title}. Exhibited solid domain vocabulary, structured communication, and technical reasoning across core interview pillars.`,
      created_at: new Date().toISOString()
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
