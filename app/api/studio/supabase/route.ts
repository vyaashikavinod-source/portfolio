import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getEditor } from "@/lib/supabase-server";

const allowed = new Set(["clauseforge", "incidentpilot", "medscout", "network-fraud-detection"]);
const validUrl = (value: string) => !value || /^https?:\/\//.test(value);
type ExperienceSaveRow = {
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
type EducationSaveRow = {
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
type StudioMutationBody = {
  profile?: Record<string, string>;
  projectLinks?: Array<{
    project_key: string;
    github_url: string;
    live_demo_url: string;
  }>;
  saveExperience?: unknown;
  deleteExperience?: unknown;
  saveEducation?: unknown;
  deleteEducation?: unknown;
};

const experienceTextFields = [
  "role",
  "organization",
  "employmentType",
  "location",
  "startDate",
  "endDate",
  "summary",
  "highlights",
  "technologies",
] as const;
const educationTextFields = [
  "institution",
  "degree",
  "field",
  "location",
  "startDate",
  "endDate",
  "status",
  "highlights",
] as const;

function isExperienceSaveRow(value: unknown): value is ExperienceSaveRow {
  if (typeof value !== "object" || value === null) return false;

  const row = value as Record<string, unknown>;
  return (
    (row.id === undefined || typeof row.id === "string") &&
    experienceTextFields.every((field) => typeof row[field] === "string") &&
    typeof row.sortOrder === "number" &&
    Number.isFinite(row.sortOrder) &&
    Number.isInteger(row.sortOrder) &&
    row.sortOrder >= 0
  );
}

const toExperienceRecord = (row: ExperienceSaveRow) => ({
  role: row.role,
  organization: row.organization,
  employment_type: row.employmentType,
  location: row.location,
  start_date: row.startDate,
  end_date: row.endDate,
  summary: row.summary,
  highlights: row.highlights,
  technologies: row.technologies,
  sort_order: row.sortOrder,
});

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isEducationSaveRow(value: unknown): value is EducationSaveRow {
  if (typeof value !== "object" || value === null) return false;

  const row = value as Record<string, unknown>;
  return (
    (row.id === undefined || isUuid(row.id)) &&
    educationTextFields.every((field) => typeof row[field] === "string") &&
    typeof row.sortOrder === "number" &&
    Number.isFinite(row.sortOrder) &&
    Number.isInteger(row.sortOrder) &&
    row.sortOrder >= 0
  );
}

const toEducationRecord = (row: EducationSaveRow) => ({
  institution: row.institution,
  degree: row.degree,
  field: row.field,
  location: row.location,
  start_date: row.startDate,
  end_date: row.endDate,
  status: row.status,
  highlights: row.highlights,
  sort_order: row.sortOrder,
});

function isDeleteExperienceRequest(
  value: unknown,
): value is { id: string } {
  if (typeof value !== "object" || value === null) return false;
  const request = value as Record<string, unknown>;
  return (
    typeof request.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      request.id,
    )
  );
}

function isDeleteEducationRequest(
  value: unknown,
): value is { id: string } {
  if (typeof value !== "object" || value === null) return false;
  return isUuid((value as Record<string, unknown>).id);
}

export async function GET() { const editor = await getEditor(); const supabase = await createSupabaseServerClient(); if (!editor || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const [profile, links, experience, education] = await Promise.all([supabase.from("profile").select("*").eq("id", true).maybeSingle(), supabase.from("project_links").select("*"), supabase.from("experience").select("*").order("sort_order").order("created_at"), supabase.from("education").select("*").order("sort_order").order("created_at")]); if (profile.error || links.error || experience.error || education.error) return NextResponse.json({ error: "Unavailable" }, { status: 500 }); return NextResponse.json({ profile: profile.data, projectLinks: links.data, experience: experience.data, education: education.data }); }

export async function POST(request: Request) {
  const editor = await getEditor();
  const supabase = await createSupabaseServerClient();
  if (!editor || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const body = payload as StudioMutationBody;

  if (body.profile) {
    const p = body.profile;
    if (
      (p.professional_email && !/^\S+@\S+\.\S+$/.test(p.professional_email)) ||
      ![p.linkedin_url, p.site_url].every((value) => validUrl(value ?? ""))
    ) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }
    const { error } = await supabase.from("profile").upsert({ id: true, ...p });
    if (error) {
      return NextResponse.json({ error: "Unable to save" }, { status: 400 });
    }
    revalidatePath("/");
  }

  if (body.projectLinks) {
    if (
      body.projectLinks.some(
        (link) =>
          !allowed.has(link.project_key) ||
          !validUrl(link.github_url) ||
          !validUrl(link.live_demo_url),
      )
    ) {
      return NextResponse.json({ error: "Invalid project link" }, { status: 400 });
    }
    const { error } = await supabase.from("project_links").upsert(body.projectLinks);
    if (error) {
      return NextResponse.json({ error: "Unable to save" }, { status: 400 });
    }
    revalidatePath("/");
    revalidatePath("/projects/clauseforge");
    revalidatePath("/projects/incidentpilot");
  }

  if (body.saveExperience !== undefined) {
    if (
      !Array.isArray(body.saveExperience) ||
      !body.saveExperience.every(isExperienceSaveRow)
    ) {
      return NextResponse.json({ error: "Invalid experience" }, { status: 400 });
    }

    for (const row of body.saveExperience) {
      const record = toExperienceRecord(row);
      if (row.id) {
        const { data, error } = await supabase
          .from("experience")
          .update(record)
          .eq("id", row.id)
          .select("id")
          .maybeSingle();
        if (!error && data) continue;

        return NextResponse.json(
          { error: "Unable to save experience" },
          { status: 400 },
        );
      }

      const { error } = await supabase.from("experience").insert(record);
      if (error) {
        return NextResponse.json(
          { error: "Unable to save experience" },
          { status: 400 },
        );
      }
    }

    const { data: experience, error } = await supabase
      .from("experience")
      .select(
        "id, role, organization, employment_type, location, start_date, end_date, summary, highlights, technologies, sort_order",
      )
      .order("sort_order", { ascending: true });
    if (error) {
      return NextResponse.json(
        { error: "Unable to load experience" },
        { status: 400 },
      );
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true, experience });
  }

  if (body.saveEducation !== undefined) {
    if (
      !Array.isArray(body.saveEducation) ||
      !body.saveEducation.every(isEducationSaveRow)
    ) {
      return NextResponse.json({ error: "Invalid education" }, { status: 400 });
    }

    for (const row of body.saveEducation) {
      const record = toEducationRecord(row);
      if (row.id) {
        const { data, error } = await supabase
          .from("education")
          .update(record)
          .eq("id", row.id)
          .select("id")
          .maybeSingle();
        if (!error && data) continue;

        return NextResponse.json(
          { error: "Unable to save education" },
          { status: 400 },
        );
      }

      const { error } = await supabase.from("education").insert(record);
      if (error) {
        return NextResponse.json(
          { error: "Unable to save education" },
          { status: 400 },
        );
      }
    }

    const { data: education, error } = await supabase
      .from("education")
      .select(
        "id, institution, degree, field, location, start_date, end_date, status, highlights, sort_order",
      )
      .order("sort_order", { ascending: true });
    if (error) {
      return NextResponse.json(
        { error: "Unable to load education" },
        { status: 400 },
      );
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true, education });
  }

  if (body.deleteExperience !== undefined) {
    if (!isDeleteExperienceRequest(body.deleteExperience)) {
      return NextResponse.json({ error: "Invalid experience" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("experience")
      .delete()
      .eq("id", body.deleteExperience.id)
      .select("id")
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { error: "Unable to delete experience" },
        { status: 400 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({
      ok: true,
      deletedExperienceId: body.deleteExperience.id,
    });
  }

  if (body.deleteEducation !== undefined) {
    if (!isDeleteEducationRequest(body.deleteEducation)) {
      return NextResponse.json({ error: "Invalid education" }, { status: 400 });
    }

    const { id } = body.deleteEducation;
    const { data, error } = await supabase
      .from("education")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { error: "Unable to delete education" },
        { status: 400 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true, deletedEducationId: id });
  }

  return NextResponse.json({ ok: true });
}
