export type StageStatus = "scheduled" | "completed";

export type Athlete = {
  id: string;
  name: string;
  team: string | null;
  active: boolean;
  created_at: string;
};

export type Stage = {
  id: string;
  date: string;
  title: string;
  location: string | null;
  status: StageStatus;
  audit_url: string | null;
  sort_order: number;
  created_at: string;
};

export type ResultSeries = "ouro" | "prata" | "bronze" | "participacao";

export type Result = {
  id: string;
  athlete_id: string;
  stage_id: string;
  series: ResultSeries;
  placement: number | null;
  points: number;
  created_at: string;
};

export type RankingRow = {
  athleteId: string;
  name: string;
  team: string | null;
  totalPoints: number;
  position: number;
};

export type AthleteStageBreakdown = {
  stageId: string;
  stageTitle: string;
  stageDate: string;
  points: number;
};
