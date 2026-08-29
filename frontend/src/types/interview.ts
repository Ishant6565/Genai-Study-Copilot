export interface InterviewQuestion {
  id: string;
  question_order: number;
  question_text: string;
  category: string;
  difficulty: string;
  ideal_answer?: string;
  candidate_answer?: string;
  feedback?: string;
  score?: number;
  follow_up_question?: string;
  follow_up_answer?: string;
}

export interface InterviewEvaluation {
  id: string;
  session_id: string;
  overall_score: number; // 0 - 100
  hiring_verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Improvement';
  technical_depth_score: number; // 1 - 10
  communication_score: number;
  problem_solving_score: number;
  edge_case_score: number;
  strengths: string[];
  areas_to_improve: string[];
  summary: string;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  role_title: string;
  track: string;
  seniority: string;
  interview_type: string;
  total_questions: number;
  current_question_index: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  job_description?: string;
  created_at: string;
  questions: InterviewQuestion[];
  evaluation?: InterviewEvaluation;
}

export interface TrackConfig {
  id: string;
  title: string;
  roleTitle: string;
  iconName: string;
  badge: string;
  description: string;
  popularTopics: string[];
  defaultQuestionsCount: number;
}
