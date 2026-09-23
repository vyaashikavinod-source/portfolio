import type { StudioExperienceEntry } from "../studio-types";

type ExperienceEditorProps = {
  experience: StudioExperienceEntry[];
  onAdd: () => void;
  onChange: (
    index: number,
    field: Exclude<keyof StudioExperienceEntry, "id" | "sortOrder">,
    value: string,
  ) => void;
  onRemoveUnsaved: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
  onDelete: (id: string) => void;
  deletingId: string | null;
};

export function ExperienceEditor({
  experience,
  onAdd,
  onChange,
  onRemoveUnsaved,
  onMoveUp,
  onMoveDown,
  onSave,
  saving,
  message,
  onDelete,
  deletingId,
}: ExperienceEditorProps) {
  return (
    <section>
      <h2>Experience</h2>
      {experience.length === 0 && <p>No experience entries yet.</p>}
      {experience.map((entry, index) => (
        <fieldset key={entry.id ?? index}>
          <legend>Experience {index + 1}</legend>
          <label>
            Role
            <input
              value={entry.role}
              onChange={(event) => onChange(index, "role", event.target.value)}
            />
          </label>
          <label>
            Organization
            <input
              value={entry.organization}
              onChange={(event) =>
                onChange(index, "organization", event.target.value)
              }
            />
          </label>
          <label>
            Employment Type
            <input
              value={entry.employmentType}
              onChange={(event) =>
                onChange(index, "employmentType", event.target.value)
              }
            />
          </label>
          <label>
            Location
            <input
              value={entry.location}
              onChange={(event) =>
                onChange(index, "location", event.target.value)
              }
            />
          </label>
          <label>
            Start Date
            <input
              value={entry.startDate}
              onChange={(event) =>
                onChange(index, "startDate", event.target.value)
              }
            />
          </label>
          <label>
            End Date / Present
            <input
              value={entry.endDate}
              onChange={(event) =>
                onChange(index, "endDate", event.target.value)
              }
            />
          </label>
          <label>
            Summary
            <textarea
              value={entry.summary}
              onChange={(event) =>
                onChange(index, "summary", event.target.value)
              }
            />
          </label>
          <label>
            Highlights / Achievements
            <textarea
              value={entry.highlights}
              onChange={(event) =>
                onChange(index, "highlights", event.target.value)
              }
            />
          </label>
          <label>
            Technologies
            <textarea
              value={entry.technologies}
              onChange={(event) =>
                onChange(index, "technologies", event.target.value)
              }
            />
          </label>
          <div>
            <button
              type="button"
              className="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
            >
              Move Up
            </button>
            <button
              type="button"
              className="button"
              disabled={index === experience.length - 1}
              onClick={() => onMoveDown(index)}
            >
              Move Down
            </button>
            {entry.id ? (
              <button
                type="button"
                className="button"
                disabled={deletingId === entry.id}
                onClick={() => {
                  if (entry.id) onDelete(entry.id);
                }}
              >
                {deletingId === entry.id ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <button
                type="button"
                className="button"
                onClick={() => onRemoveUnsaved(index)}
              >
                Remove
              </button>
            )}
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={onAdd}>
        Add Experience
      </button>
      <button
        type="button"
        className="button"
        disabled={saving}
        onClick={onSave}
      >
        {saving ? "Saving..." : "Save Experience"}
      </button>
      {message && <p aria-live="polite">{message}</p>}
    </section>
  );
}
