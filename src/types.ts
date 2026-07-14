export interface Question {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  scenario: string;
  questionText: string;
  solutionQuery: string;
  hint: string;
  concepts: string[];
}

export interface TableMeta {
  name: string;
  schema: string;
  desc: string;
}

export interface TrainingSession {
  number: number;
  title: string;
  domain: string;
  topics: string[];
  tables: TableMeta[];
  questions: Question[];
  seedSQL: string;
}

export interface UserProgress {
  completedQuestions: string[]; // List of question IDs completed
  savedQueries: Record<string, string>; // questionId -> user typed SQL
  notes: Record<string, string>; // questionId -> user note/thoughts
}
