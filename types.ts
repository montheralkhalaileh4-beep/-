
export interface Verb {
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
  arabic: string;
}

export enum QuizState {
  IDLE = 'IDLE',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  GAME_OVER = 'GAME_OVER',
}

export interface AnswerRecord {
  verb: Verb;
  userPastSimple: string;
  userPastParticiple: string;
}