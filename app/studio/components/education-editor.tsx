import type { StudioEducationEntry } from "../studio-types";

type EducationEditorProps = {
  education: StudioEducationEntry[];
  onAdd: () => void;
  onChange: (
    index: number,
    field: Exclude<keyof StudioEducationEntry, "id" | "sortOrder">,
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

export function EducationEditor({
  education,
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
}: EducationEditorProps) {
  return (
    <section>
      <h2>Education</h2>
      {education.length === 0 && <p>No education entries yet.</p>}
      {education.map((entry, index) => (
        <fieldset key={entry.id ?? index}>
          <legend>Education {index + 1}</legend>
          <label>
            Institution
            <input
              value={entry.institution}
              onChange={(event) =>
                onChange(index, "institution", event.target.value)
              }
            />
          </label>
          <label>
            Degree
            <input
              value={entry.degree}
              onChange={(event) => onChange(index, "degree", event.target.value)}
            />
          </label>
          <label>
            Field
            <input
              value={entry.field}
              onChange={(event) => onChange(index, "field", event.target.value)}
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
            End Date
            <input
              value={entry.endDate}
              onChange={(event) =>
                onChange(index, "endDate", event.target.value)
              }
            />
          </label>
          <label>
            Status
            <input
              value={entry.status}
              onChange={(event) => onChange(index, "status", event.target.value)}
            />
          </label>
          <label>
            Highlights
            <textarea
              value={entry.highlights}
              onChange={(event) =>
                onChange(index, "highlights", event.target.value)
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
              disabled={index === education.length - 1}
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
        Add Education
      </button>
      <button
        type="button"
        className="button"
        disabled={saving}
        onClick={onSave}
      >
        {saving ? "Saving..." : "Save Education"}
      </button>
      {message && <p aria-live="polite">{message}</p>}
    </section>
  );
}
