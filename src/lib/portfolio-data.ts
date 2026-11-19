import "server-only";
import fallback from "@/data/content/site-content.json";
import type { EducationEntry, ExperienceEntry, ProfileContent, ProjectLinks } from "@/data/content/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const projectNames: Record<string, string> = { clauseforge: "ClauseForge", incidentpilot: "IncidentPilot", medscout: "MedScout", "network-fraud-detection": "Intelligent Network Fraud Detection System" };

export async function getPortfolioContent(): Promise<{ profile: ProfileContent; experience: ExperienceEntry[]; education: EducationEntry[]; projectLinks: ProjectLinks }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallback;
  const [profileResult, experienceResult, educationResult, linksResult] = await Promise.all([supabase.from("profile").select("*").eq("id", true).maybeSingle(), supabase.from("experience").select("*").order("sort_order").order("created_at"), supabase.from("education").select("*").order("sort_order").order("created_at"), supabase.from("project_links").select("*")]);
  if (profileResult.error || experienceResult.error || educationResult.error || linksResult.error) return fallback;
  const profile = profileResult.data ? { displayName: profileResult.data.display_name ?? undefined, shortName: profileResult.data.short_name ?? undefined, professionalHeadline: profileResult.data.professional_headline ?? undefined, email: profileResult.data.professional_email ?? undefined, linkedinUrl: profileResult.data.linkedin_url ?? undefined, location: profileResult.data.location ?? undefined, availabilityText: profileResult.data.availability_text ?? undefined, siteUrl: profileResult.data.site_url ?? undefined, githubUsername: profileResult.data.github_username, resumeUrl: profileResult.data.resume_url ?? undefined } : fallback.profile;
  const experience = experienceResult.data.map((row) => ({ role: row.role, organization: row.organization, employmentType: row.employment_type ?? "", location: row.location ?? "", startDate: row.start_date ?? "", endDate: row.end_date ?? "", summary: row.summary ?? "", highlights: row.highlights ?? "", technologies: row.technologies ?? "" }));
  const education = educationResult.data.map((row) => ({ institution: row.institution, degree: row.degree ?? "", field: row.field ?? "", location: row.location ?? "", startDate: row.start_date ?? "", endDate: row.end_date ?? "", status: row.status ?? "", highlights: row.highlights ?? "" }));
  const projectLinks: ProjectLinks = { ...fallback.projectLinks };
  for (const row of linksResult.data) {
    const title = projectNames[row.project_key];
    if (!title) continue;
    projectLinks[title] = {
      githubUrl: row.github_url?.trim() || projectLinks[title]?.githubUrl,
      liveDemoUrl: row.live_demo_url?.trim() || projectLinks[title]?.liveDemoUrl,
    };
  }
  return { profile, experience, education, projectLinks };
}
