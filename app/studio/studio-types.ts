export type StudioExperienceEntry = {
  id?: string;
  role: string;
  organization: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string;
  technologies: string;
  sortOrder: number;
};

export type StudioEducationEntry = {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  highlights: string;
  sortOrder: number;
};

export type StudioContentState = Omit<
  SiteContent,
  "experience" | "education"
> & {
  experience: StudioExperienceEntry[];
  education: StudioEducationEntry[];
};
import type { SiteContent } from "@/data/content/types";
