"use client";

import "./studio.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/data/content/types";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { EducationEditor } from "./components/education-editor";
import { ExperienceEditor } from "./components/experience-editor";
import type {
  StudioContentState,
  StudioEducationEntry,
  StudioExperienceEntry,
} from "./studio-types";

const names = [
  "ClauseForge",
  "IncidentPilot",
  "MedScout",
  "Intelligent Network Fraud Detection System",
] as const;
const empty: StudioContentState = {
  profile: { githubUsername: "ruwactrl" },
  experience: [],
  education: [],
  projectLinks: {},
};
type StudioExperienceRow = {
  id: string;
  role: string;
  organization: string;
  employment_type: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  summary: string | null;
  highlights: string | null;
  technologies: string | null;
  sort_order: number;
};
type StudioEducationRow = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  highlights: string | null;
  sort_order: number;
};
type StudioSupabaseResponse = {
  profile?: Record<string, string | null>;
  experience?: StudioExperienceRow[];
  education?: StudioEducationRow[];
  projectLinks?: Array<{
    project_key: string;
    github_url: string | null;
    live_demo_url: string | null;
  }>;
};
type SaveExperienceResponse = {
  ok: true;
  experience: StudioExperienceRow[];
};
type DeleteExperienceResponse = {
  ok: true;
  deletedExperienceId: string;
};
type SaveEducationResponse = {
  ok: true;
  education: StudioEducationRow[];
};
type DeleteEducationResponse = {
  ok: true;
  deletedEducationId: string;
};
type ResumeUploadResponse = {
  ok: true;
  resumeUrl: string;
};
function isStudioSupabaseResponse(
  value: unknown,
): value is StudioSupabaseResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    (data.profile === undefined ||
      (typeof data.profile === "object" && data.profile !== null)) &&
    (data.projectLinks === undefined || Array.isArray(data.projectLinks)) &&
    (data.experience === undefined || Array.isArray(data.experience)) &&
    (data.education === undefined || Array.isArray(data.education))
  );
}

function isSaveExperienceResponse(
  value: unknown,
): value is SaveExperienceResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return data.ok === true && Array.isArray(data.experience);
}

function isDeleteExperienceResponse(
  value: unknown,
): value is DeleteExperienceResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return data.ok === true && typeof data.deletedExperienceId === "string";
}

function isSaveEducationResponse(
  value: unknown,
): value is SaveEducationResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return data.ok === true && Array.isArray(data.education);
}

function isDeleteEducationResponse(
  value: unknown,
): value is DeleteEducationResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return data.ok === true && typeof data.deletedEducationId === "string";
}

function isResumeUploadResponse(
  value: unknown,
): value is ResumeUploadResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return data.ok === true && typeof data.resumeUrl === "string";
}

const normalizeExperienceSortOrder = (
  experience: StudioExperienceEntry[],
) => experience.map((entry, index) => ({ ...entry, sortOrder: index }));
const normalizeEducationSortOrder = (education: StudioEducationEntry[]) =>
  education.map((entry, index) => ({ ...entry, sortOrder: index }));

export function Studio() {
  const router = useRouter();
  const [content, setContent] = useState<StudioContentState>(empty);
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");
  const [experienceSaving, setExperienceSaving] = useState(false);
  const [experienceMessage, setExperienceMessage] = useState("");
  const [deletingExperienceId, setDeletingExperienceId] = useState<string | null>(
    null,
  );
  const [educationSaving, setEducationSaving] = useState(false);
  const [educationMessage, setEducationMessage] = useState("");
  const [deletingEducationId, setDeletingEducationId] = useState<string | null>(
    null,
  );
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    fetch("/api/studio/supabase")
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok || !isStudioSupabaseResponse(payload)) {
          setMessage("Unable to load Studio content.");
          return;
        }
        setContent((current) => ({
          ...current,
          profile: payload.profile
            ? {
                displayName: payload.profile.display_name ?? undefined,
                shortName: payload.profile.short_name ?? undefined,
                professionalHeadline:
                  payload.profile.professional_headline ?? undefined,
                email: payload.profile.professional_email ?? undefined,
                linkedinUrl: payload.profile.linkedin_url ?? undefined,
                location: payload.profile.location ?? undefined,
                availabilityText:
                  payload.profile.availability_text ?? undefined,
                siteUrl: payload.profile.site_url ?? undefined,
                githubUsername:
                  payload.profile.github_username ??
                  current.profile.githubUsername,
                resumeUrl: payload.profile.resume_url ?? undefined,
              }
            : current.profile,
          experience: (payload.experience ?? []).map((row) => ({
            id: row.id,
            role: row.role,
            organization: row.organization,
            employmentType: row.employment_type ?? "",
            location: row.location ?? "",
            startDate: row.start_date ?? "",
            endDate: row.end_date ?? "",
            summary: row.summary ?? "",
            highlights: row.highlights ?? "",
            technologies: row.technologies ?? "",
            sortOrder: row.sort_order,
          })),
          education: (payload.education ?? []).map((row) => ({
            id: row.id,
            institution: row.institution,
            degree: row.degree ?? "",
            field: row.field ?? "",
            location: row.location ?? "",
            startDate: row.start_date ?? "",
            endDate: row.end_date ?? "",
            status: row.status ?? "",
            highlights: row.highlights ?? "",
            sortOrder: row.sort_order,
          })),
          projectLinks: Object.fromEntries(
            (payload.projectLinks ?? []).map((item) => [
              {
                clauseforge: "ClauseForge",
                incidentpilot: "IncidentPilot",
                medscout: "MedScout",
                "network-fraud-detection":
                  "Intelligent Network Fraud Detection System",
              }[item.project_key] ?? item.project_key,
              {
                githubUrl: item.github_url ?? undefined,
                liveDemoUrl: item.live_demo_url ?? undefined,
              },
            ]),
          ),
        }));
        setMessage("");
      })
      .catch(() => setMessage("Unable to load Studio content."));
  }, []);
  const profile = (key: keyof SiteContent["profile"], value: string) =>
    setContent((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value },
    }));
  const link = (
    name: string,
    key: "githubUrl" | "liveDemoUrl",
    value: string,
  ) =>
    setContent((current) => ({
      ...current,
      projectLinks: {
        ...current.projectLinks,
        [name]: { ...current.projectLinks[name], [key]: value },
      },
    }));
  const updateExperienceField = (
    index: number,
    field: Exclude<keyof StudioExperienceEntry, "id" | "sortOrder">,
    value: string,
  ) =>
    setContent((current) => ({
      ...current,
      experience: current.experience.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  const removeUnsavedExperience = (index: number) =>
    setContent((current) => {
      const entry = current.experience[index];
      if (!entry || entry.id) return current;

      return {
        ...current,
        experience: normalizeExperienceSortOrder(
          current.experience.filter((_, entryIndex) => entryIndex !== index),
        ),
      };
    });
  const moveExperienceUp = (index: number) =>
    setContent((current) => {
      if (index <= 0 || index >= current.experience.length) return current;

      const experience = [...current.experience];
      [experience[index - 1], experience[index]] = [
        experience[index],
        experience[index - 1],
      ];
      return {
        ...current,
        experience: normalizeExperienceSortOrder(experience),
      };
    });
  const moveExperienceDown = (index: number) =>
    setContent((current) => {
      if (index < 0 || index >= current.experience.length - 1) return current;

      const experience = [...current.experience];
      [experience[index], experience[index + 1]] = [
        experience[index + 1],
        experience[index],
      ];
      return {
        ...current,
        experience: normalizeExperienceSortOrder(experience),
      };
    });
  const updateEducationField = (
    index: number,
    field: Exclude<keyof StudioEducationEntry, "id" | "sortOrder">,
    value: string,
  ) =>
    setContent((current) => ({
      ...current,
      education: current.education.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  const removeUnsavedEducation = (index: number) =>
    setContent((current) => {
      const entry = current.education[index];
      if (!entry || entry.id) return current;

      return {
        ...current,
        education: normalizeEducationSortOrder(
          current.education.filter((_, entryIndex) => entryIndex !== index),
        ),
      };
    });
  const moveEducationUp = (index: number) =>
    setContent((current) => {
      if (index <= 0 || index >= current.education.length) return current;

      const education = [...current.education];
      [education[index - 1], education[index]] = [
        education[index],
        education[index - 1],
      ];
      return {
        ...current,
        education: normalizeEducationSortOrder(education),
      };
    });
  const moveEducationDown = (index: number) =>
    setContent((current) => {
      if (index < 0 || index >= current.education.length - 1) return current;

      const education = [...current.education];
      [education[index], education[index + 1]] = [
        education[index + 1],
        education[index],
      ];
      return {
        ...current,
        education: normalizeEducationSortOrder(education),
      };
    });
  const saveExperience = async () => {
    setExperienceSaving(true);
    setExperienceMessage("");
    try {
      const response = await fetch("/api/studio/supabase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ saveExperience: content.experience }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isSaveExperienceResponse(payload)) {
        setExperienceMessage("Unable to save experience.");
        return;
      }

      setContent((current) => ({
        ...current,
        experience: payload.experience.map((row) => ({
          id: row.id,
          role: row.role,
          organization: row.organization,
          employmentType: row.employment_type ?? "",
          location: row.location ?? "",
          startDate: row.start_date ?? "",
          endDate: row.end_date ?? "",
          summary: row.summary ?? "",
          highlights: row.highlights ?? "",
          technologies: row.technologies ?? "",
          sortOrder: row.sort_order,
        })),
      }));
      setExperienceMessage("Experience saved.");
    } catch {
      setExperienceMessage("Unable to save experience.");
    } finally {
      setExperienceSaving(false);
    }
  };
  const deleteExperience = async (id: string) => {
    if (!window.confirm("Delete this experience entry? This cannot be undone.")) {
      return;
    }

    setDeletingExperienceId(id);
    setExperienceMessage("");
    try {
      const response = await fetch("/api/studio/supabase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deleteExperience: { id } }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isDeleteExperienceResponse(payload)) {
        setExperienceMessage("Unable to delete experience.");
        return;
      }

      setContent((current) => ({
        ...current,
        experience: current.experience.filter(
          (entry) => entry.id !== payload.deletedExperienceId,
        ),
      }));
      setExperienceMessage("Experience deleted.");
    } catch {
      setExperienceMessage("Unable to delete experience.");
    } finally {
      setDeletingExperienceId(null);
    }
  };
  const saveEducation = async () => {
    setEducationSaving(true);
    setEducationMessage("");
    try {
      const response = await fetch("/api/studio/supabase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ saveEducation: content.education }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isSaveEducationResponse(payload)) {
        setEducationMessage("Unable to save education.");
        return;
      }

      setContent((current) => ({
        ...current,
        education: payload.education.map((row) => ({
          id: row.id,
          institution: row.institution,
          degree: row.degree ?? "",
          field: row.field ?? "",
          location: row.location ?? "",
          startDate: row.start_date ?? "",
          endDate: row.end_date ?? "",
          status: row.status ?? "",
          highlights: row.highlights ?? "",
          sortOrder: row.sort_order,
        })),
      }));
      setEducationMessage("Education saved.");
    } catch {
      setEducationMessage("Unable to save education.");
    } finally {
      setEducationSaving(false);
    }
  };
  const deleteEducation = async (id: string) => {
    if (!window.confirm("Delete this education entry? This cannot be undone.")) {
      return;
    }

    setDeletingEducationId(id);
    setEducationMessage("");
    try {
      const response = await fetch("/api/studio/supabase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deleteEducation: { id } }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isDeleteEducationResponse(payload)) {
        setEducationMessage("Unable to delete education.");
        return;
      }

      setContent((current) => ({
        ...current,
        education: current.education.filter(
          (entry) => entry.id !== payload.deletedEducationId,
        ),
      }));
      setEducationMessage("Education deleted.");
    } catch {
      setEducationMessage("Unable to delete education.");
    } finally {
      setDeletingEducationId(null);
    }
  };
  const save = async () => {
    setMessage("Saving...");
    const keys: Record<string, string> = {
      ClauseForge: "clauseforge",
      IncidentPilot: "incidentpilot",
      MedScout: "medscout",
      "Intelligent Network Fraud Detection System": "network-fraud-detection",
    };
    const profile = {
      display_name: content.profile.displayName ?? "",
      short_name: content.profile.shortName ?? "",
      professional_headline: content.profile.professionalHeadline ?? "",
      professional_email: content.profile.email ?? "",
      linkedin_url: content.profile.linkedinUrl ?? "",
      location: content.profile.location ?? "",
      availability_text: content.profile.availabilityText ?? "",
      site_url: content.profile.siteUrl ?? "",
      github_username: content.profile.githubUsername,
      resume_url: content.profile.resumeUrl ?? "",
    };
    const projectLinks = Object.entries(keys).map(([name, project_key]) => ({
      project_key,
      github_url: content.projectLinks[name]?.githubUrl ?? "",
      live_demo_url: content.projectLinks[name]?.liveDemoUrl ?? "",
    }));
    const response = await fetch("/api/studio/supabase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile, projectLinks }),
    });
    setMessage(response.ok ? "Saved" : "Save failed");
  };
  const uploadResume = async () => {
    if (!resume) {
      setResumeMessage("Select a PDF resume.");
      return;
    }
    if (resume.type !== "application/pdf") {
      setResumeMessage("Select a PDF resume.");
      return;
    }
    if (resume.size > 10 * 1024 * 1024) {
      setResumeMessage("Resume must be 10 MB or smaller.");
      return;
    }

    setResumeUploading(true);
    setResumeMessage("");
    const form = new FormData();
    form.append("resume", resume);
    try {
      const response = await fetch("/api/studio/resume", {
        method: "POST",
        body: form,
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isResumeUploadResponse(payload)) {
        setResumeMessage("Unable to upload resume.");
        return;
      }

      setContent((current) => ({
        ...current,
        profile: { ...current.profile, resumeUrl: payload.resumeUrl },
      }));
      setResume(null);
      setResumeMessage("Resume uploaded.");
    } catch {
      setResumeMessage("Unable to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };
  const signOut = async () => {
    setSigningOut(true);
    setMessage("");
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut();
      if (error) {
        setMessage("Unable to sign out.");
        return;
      }
      router.replace("/studio/login");
      router.refresh();
    } catch {
      setMessage("Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <main className="wrap studio">
      <p className="eyebrow accent">Local development tool</p>
      <h1>Portfolio Content Studio</h1>
      <button type="button" className="button" disabled={signingOut} onClick={signOut}>
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>
      <div className="case-metrics">
        <div>
          <span>Profile Name</span>
          <strong>
            {content.profile.displayName ? "Configured" : "Missing"}
          </strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{content.profile.email ? "Configured" : "Missing"}</strong>
        </div>
        <div>
          <span>Experience</span>
          <strong>{content.experience.length} entries</strong>
        </div>
        <div>
          <span>Education</span>
          <strong>{content.education.length} entries</strong>
        </div>
      </div>
      <section>
        <h2>Profile</h2>
        <div className="studio-grid">
          {(
            [
              ["displayName", "Display Name"],
              ["shortName", "Short Name"],
              ["professionalHeadline", "Professional Headline"],
              ["email", "Professional Email"],
              ["linkedinUrl", "LinkedIn URL"],
              ["location", "Location"],
              ["availabilityText", "Availability"],
              ["siteUrl", "Site URL"],
              ["githubUsername", "GitHub Username"],
            ] as [keyof SiteContent["profile"], string][]
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={content.profile[key] ?? ""}
                onChange={(event) => profile(key, event.target.value)}
              />
            </label>
          ))}
        </div>
      </section>
      <ExperienceEditor
        experience={content.experience}
        onChange={updateExperienceField}
        onRemoveUnsaved={removeUnsavedExperience}
        onMoveUp={moveExperienceUp}
        onMoveDown={moveExperienceDown}
        onSave={saveExperience}
        saving={experienceSaving}
        message={experienceMessage}
        onDelete={deleteExperience}
        deletingId={deletingExperienceId}
        onAdd={() => setContent((current) => ({ ...current, experience: [...current.experience, { role: "", organization: "", employmentType: "", location: "", startDate: "", endDate: "", summary: "", highlights: "", technologies: "", sortOrder: current.experience.length }] }))}
      />
      <EducationEditor
        education={content.education}
        onChange={updateEducationField}
        onRemoveUnsaved={removeUnsavedEducation}
        onMoveUp={moveEducationUp}
        onMoveDown={moveEducationDown}
        onSave={saveEducation}
        saving={educationSaving}
        message={educationMessage}
        onDelete={deleteEducation}
        deletingId={deletingEducationId}
        onAdd={() =>
          setContent((current) => ({
            ...current,
            education: [
              ...current.education,
              {
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                location: "",
                status: "",
                highlights: "",
                sortOrder: current.education.length,
              },
            ],
          }))
        }
      />
      <section>
        <h2>Project Links</h2>
        {names.map((name) => (
          <fieldset key={name}>
            <legend>{name}</legend>
            <label>
              GitHub URL
              <input
                type="url"
                value={content.projectLinks[name]?.githubUrl ?? ""}
                onChange={(event) =>
                  link(name, "githubUrl", event.target.value)
                }
              />
            </label>
            <label>
              Live Demo URL
              <input
                type="url"
                value={content.projectLinks[name]?.liveDemoUrl ?? ""}
                onChange={(event) =>
                  link(name, "liveDemoUrl", event.target.value)
                }
              />
            </label>
          </fieldset>
        ))}
      </section>
      <section>
        <h2>Resume</h2>
        <p>
          {content.profile.resumeUrl
            ? "Resume configured"
            : "No resume uploaded"}
        </p>
        {content.profile.resumeUrl && (
          <a
            className="button"
            href={content.profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Current Resume
          </a>
        )}
        <label>
          Resume PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              setResume(event.target.files?.[0] ?? null);
              setResumeMessage("");
            }}
          />
        </label>
        {resume && <p>{resume.name}</p>}
        <button
          type="button"
          className="button"
          disabled={resumeUploading}
          onClick={uploadResume}
        >
          {resumeUploading ? "Uploading..." : "Upload Resume"}
        </button>
        {resumeMessage && <p aria-live="polite">{resumeMessage}</p>}
      </section>
      <button className="button primary" onClick={save}>
        Save Portfolio Content
      </button>
      <p aria-live="polite">{message}</p>
      <a className="button" target="_blank" rel="noopener noreferrer" href="/">
        Open Portfolio Preview
      </a>
    </main>
  );
}
