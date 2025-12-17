import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearToken, isAuthenticated } from "../../lib/auth";
import { ApiError } from "../../lib/apiClient";
import {
  EventStatus,
  EventType,
  ObservableDetail,
  ObservableStatus,
  createEvent,
  createObservable,
  deleteEvent,
  deleteObservable,
  getObservable,
  listObservables,
  updateEvent,
  updateObservable,
} from "../../lib/observablesApi";

type ObservableForm = {
  name: string;
  metadata: string;
  status: ObservableStatus;
};

type EventForm = {
  label: string;
  type: EventType;
  status: EventStatus;
  weight: string;
  sequence_index: string;
  is_cutoff: boolean;
  description?: string;
};

const defaultObservableForm: ObservableForm = { name: "", metadata: "", status: "STABLE" };
const defaultEventForm: EventForm = {
  label: "",
  type: "PAST",
  status: "PLANNED",
  weight: "1",
  sequence_index: "0",
  is_cutoff: false,
  description: "",
};

export function ObservablesPage() {
  const [observables, setObservables] = useState<ObservableDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<ObservableForm>(defaultObservableForm);
  const [creating, setCreating] = useState(false);

  const [editForms, setEditForms] = useState<Record<number, ObservableForm>>({});
  const [eventForms, setEventForms] = useState<Record<number, EventForm>>({});
  const [editingEvent, setEditingEvent] = useState<{
    observableId: number;
    eventId: number;
    form: EventForm;
  } | null>(null);
  const [busyObservableId, setBusyObservableId] = useState<number | null>(null);
  const [busyEventId, setBusyEventId] = useState<number | null>(null);

  const navigate = useNavigate();

  const humanizeError = (err: unknown) => {
    if (err instanceof ApiError && err.status) {
      if (typeof err.data === "object" && err.data && "detail" in err.data) {
        return String((err.data as { detail: string }).detail);
      }
      return `Request failed (${err.status})`;
    }
    if (err instanceof Error) return err.message;
    return "Something went wrong";
  };

  const parseMetadata = (input: string): Record<string, unknown> => {
    if (!input.trim()) return {};
    return JSON.parse(input);
  };

  const loadObservables = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const summary = await listObservables();
      const detailed = await Promise.all(
        summary.map(async (item) => {
          try {
            return await getObservable(item.id);
          } catch {
            return { ...item, events: [] };
          }
        }),
      );
      setObservables(detailed);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        navigate("/login");
        return;
      }
      setError("Unable to load observables");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    void loadObservables();
  }, [navigate, loadObservables]);

  const refreshObservable = useCallback(async (observableId: number) => {
    const detail = await getObservable(observableId);
    setObservables((prev) => {
      const exists = prev.some((o) => o.id === observableId);
      if (!exists) return [...prev, detail];
      return prev.map((o) => (o.id === observableId ? detail : o));
    });
  }, []);

  const handleCreateObservable = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!createForm.name.trim()) {
      setError("Name is required");
      return;
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadata(createForm.metadata);
    } catch {
      setError("Metadata must be valid JSON");
      return;
    }

    setCreating(true);
    try {
      const created = await createObservable({
        name: createForm.name.trim(),
        metadata,
        status: createForm.status,
      });
      setObservables((prev) => [...prev, created]);
      setCreateForm(defaultObservableForm);
      setSuccess("Observable created");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setCreating(false);
    }
  };

  const startEditObservable = (observable: ObservableDetail) => {
    setEditForms((prev) => ({
      ...prev,
      [observable.id]: {
        name: observable.name,
        metadata: JSON.stringify(observable.metadata ?? {}),
        status: observable.status,
      },
    }));
    setSuccess(null);
    setError(null);
  };

  const handleUpdateObservable = async (observableId: number) => {
    const form = editForms[observableId];
    if (!form) return;
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadata(form.metadata);
    } catch {
      setError("Metadata must be valid JSON");
      return;
    }

    setBusyObservableId(observableId);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateObservable(observableId, {
        name: form.name.trim(),
        metadata,
        status: form.status,
      });
      setObservables((prev) => prev.map((o) => (o.id === observableId ? updated : o)));
      setEditForms((prev) => {
        const next = { ...prev };
        delete next[observableId];
        return next;
      });
      setSuccess("Observable updated");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusyObservableId(null);
    }
  };

  const handleDeleteObservable = async (observableId: number) => {
    if (!confirm("Delete this observable and all events?")) {
      return;
    }
    setBusyObservableId(observableId);
    setError(null);
    setSuccess(null);
    try {
      await deleteObservable(observableId);
      setObservables((prev) => prev.filter((o) => o.id !== observableId));
      setSuccess("Observable deleted");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusyObservableId(null);
    }
  };

  const getEventForm = (observableId: number): EventForm =>
    eventForms[observableId] ?? { ...defaultEventForm };

  const setEventForm = (observableId: number, form: EventForm) =>
    setEventForms((prev) => ({ ...prev, [observableId]: form }));

  const resetEventForm = (observableId: number) =>
    setEventForms((prev) => {
      const next = { ...prev };
      delete next[observableId];
      return next;
    });

  const validateEventForm = (form: EventForm): string | null => {
    if (!form.label.trim()) return "Event label is required";
    const weight = Number(form.weight);
    if (Number.isNaN(weight) || weight <= 0) return "Event weight must be greater than 0";
    const seq = Number(form.sequence_index);
    if (Number.isNaN(seq) || seq < 0) return "Sequence index must be 0 or greater";
    return null;
  };

  const handleCreateEvent = async (observableId: number) => {
    const form = getEventForm(observableId);
    const validation = validateEventForm(form);
    if (validation) {
      setError(validation);
      return;
    }

    setBusyEventId(observableId);
    setError(null);
    setSuccess(null);
    try {
      await createEvent(observableId, {
        label: form.label.trim(),
        type: form.type,
        status: form.status,
        weight: Number(form.weight),
        sequence_index: Number(form.sequence_index),
        is_cutoff: form.is_cutoff,
        description: form.description?.trim() || undefined,
      });
      await refreshObservable(observableId);
      resetEventForm(observableId);
      setSuccess("Event created and utility refreshed");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusyEventId(null);
    }
  };

  const startEditEvent = (observableId: number, event: ObservableDetail["events"][number]) => {
    setEditingEvent({
      observableId,
      eventId: event.id,
      form: {
        label: event.label,
        type: event.type,
        status: event.status,
        weight: String(event.weight),
        sequence_index: String(event.sequence_index),
        is_cutoff: event.is_cutoff,
        description: event.description ?? "",
      },
    });
    setSuccess(null);
    setError(null);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    const { observableId, eventId, form } = editingEvent;
    const validation = validateEventForm(form);
    if (validation) {
      setError(validation);
      return;
    }
    setBusyEventId(eventId);
    setError(null);
    setSuccess(null);
    try {
      await updateEvent(eventId, {
        label: form.label.trim(),
        type: form.type,
        status: form.status,
        weight: Number(form.weight),
        sequence_index: Number(form.sequence_index),
        is_cutoff: form.is_cutoff,
        description: form.description?.trim() || undefined,
      });
      await refreshObservable(observableId);
      setEditingEvent(null);
      setSuccess("Event updated and utility refreshed");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusyEventId(null);
    }
  };

  const handleDeleteEvent = async (observableId: number, eventId: number) => {
    if (!confirm("Delete this event?")) return;
    setBusyEventId(eventId);
    setError(null);
    setSuccess(null);
    try {
      await deleteEvent(eventId);
      await refreshObservable(observableId);
      setSuccess("Event deleted and utility refreshed");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusyEventId(null);
    }
  };

  const statusOptions: ObservableStatus[] = useMemo(
    () => ["STABLE", "AT_RISK", "OPTIMIZED"],
    [],
  );

  return (
    <div className="card" style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Observables</h2>
        <p style={{ margin: "0.25rem 0", color: "var(--muted)" }}>
          Create, edit, and manage events. Utility updates automatically after each change.
        </p>
      </div>

      {(error || success) && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: 8,
            border: `1px solid ${error ? "var(--accent)" : "var(--success)"}`,
            color: error ? "var(--accent)" : "var(--success)",
            background: "var(--bg)",
          }}
        >
          {error ?? success}
        </div>
      )}

      <form
        onSubmit={handleCreateObservable}
        style={{ display: "grid", gap: "0.75rem", padding: "1rem", border: "1px dashed var(--border)", borderRadius: 12 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>Create observable</div>
          <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Name + optional metadata JSON</div>
        </div>
        <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 160px" }}>
          <label style={labelStyle}>
            <span>Name</span>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            <span>Status</span>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as ObservableStatus }))}
              style={inputStyle}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label style={labelStyle}>
          <span>Metadata (JSON, optional)</span>
          <textarea
            value={createForm.metadata}
            onChange={(e) => setCreateForm((f) => ({ ...f, metadata: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
            placeholder='e.g. {"cohort": "alpha"}'
          />
        </label>
        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create observable"}
        </button>
      </form>

      {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
      {!loading && observables.length === 0 && (
        <div style={{ color: "var(--muted)" }}>No observables yet.</div>
      )}

      {!loading && observables.length > 0 && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {observables.map((obs) => {
            const editForm = editForms[obs.id];
            const isEditing = Boolean(editForm);
            const addEventForm = getEventForm(obs.id);
            const editingCurrentEvent = editingEvent?.observableId === obs.id ? editingEvent.form : null;

            return (
              <div
                key={obs.id}
                className="card"
                style={{
                  display: "grid",
                  gap: "1.25rem",
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ display: "grid", gap: "0.25rem" }}>
                    <div style={{ fontWeight: 700, letterSpacing: "-0.01em", fontSize: "1.125rem" }}>{obs.name}</div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        padding: "0.125rem 0.5rem", 
                        borderRadius: "999px", 
                        background: obs.status === "STABLE" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                        color: obs.status === "STABLE" ? "var(--success)" : "var(--warning)",
                        fontSize: "0.75rem",
                        fontWeight: 600
                      }}>
                        {obs.status}
                      </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Distance: <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{obs.utility_distance.toFixed(2)}</span>
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>•</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Utility: <span style={{ fontFamily: "monospace" }}>x:{obs.utility_x.toFixed(2)} y:{obs.utility_y.toFixed(2)}</span>
                      </span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      Metadata: {Object.keys(obs.metadata || {}).length === 0 ? "—" : JSON.stringify(obs.metadata)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    {!isEditing && (
                      <button onClick={() => startEditObservable(obs)} disabled={busyObservableId === obs.id}>
                        Edit
                      </button>
                    )}
                    {isEditing && (
                      <>
                        <button
                          onClick={() => void handleUpdateObservable(obs.id)}
                          disabled={busyObservableId === obs.id}
                          style={{ background: "var(--text)", color: "white", borderColor: "var(--text)" }}
                        >
                          {busyObservableId === obs.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() =>
                            setEditForms((prev) => {
                              const next = { ...prev };
                              delete next[obs.id];
                              return next;
                            })
                          }
                          disabled={busyObservableId === obs.id}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void handleDeleteObservable(obs.id)}
                      disabled={busyObservableId === obs.id}
                      style={{ color: "var(--error)", borderColor: "var(--error)", background: "transparent" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isEditing && editForm && (
                  <div style={{ display: "grid", gap: "1rem", padding: "1rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 180px" }}>
                      <label style={labelStyle}>
                        <span>Name</span>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForms((prev) => ({
                              ...prev,
                              [obs.id]: { ...editForm, name: e.target.value },
                            }))
                          }
                          style={inputStyle}
                        />
                      </label>
                      <label style={labelStyle}>
                        <span>Status</span>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForms((prev) => ({
                              ...prev,
                              [obs.id]: { ...editForm, status: e.target.value as ObservableStatus },
                            }))
                          }
                          style={inputStyle}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label style={labelStyle}>
                      <span>Metadata (JSON)</span>
                      <textarea
                        value={editForm.metadata}
                        onChange={(e) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [obs.id]: { ...editForm, metadata: e.target.value },
                          }))
                        }
                        rows={3}
                        style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
                      />
                    </label>
                  </div>
                )}

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Events Timeline</div>
                  <EventChain events={obs.events} />
                  {obs.events.length > 0 && (
                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                      {obs.events.map((event) => (
                        <div
                          key={event.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.75rem",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--bg)",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-hover)";
                            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "grid", gap: "0.25rem" }}>
                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{event.label}</span>
                              <span style={{ 
                                fontSize: "0.75rem", 
                                padding: "0.1rem 0.4rem", 
                                borderRadius: "4px", 
                                background: "var(--bg-raised)", 
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)"
                              }}>
                                {event.type}
                              </span>
                              <span style={{ 
                                fontSize: "0.75rem", 
                                color: event.status === "FAILED" ? "var(--error)" : "var(--text-secondary)",
                                fontWeight: event.status === "FAILED" ? 600 : 400
                              }}>
                                {event.status}
                              </span>
                              {event.is_cutoff && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    padding: "0.1rem 0.5rem",
                                    borderRadius: "999px",
                                    border: "1px solid var(--accent)",
                                    color: "var(--accent)",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  CUTOFF
                                </span>
                              )}
                              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                                w:{event.weight} · seq:{event.sequence_index}
                              </span>
                            </div>
                            {event.description && (
                              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                {event.description}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => startEditEvent(obs.id, event)}
                              disabled={busyEventId === event.id}
                              style={{ height: "28px", fontSize: "0.8rem", padding: "0 0.75rem" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDeleteEvent(obs.id, event.id)}
                              disabled={busyEventId === event.id}
                              style={{ height: "28px", fontSize: "0.8rem", padding: "0 0.75rem", color: "var(--error)", borderColor: "var(--border)" }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {editingCurrentEvent && editingEvent && (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
                    <div style={{ fontWeight: 600 }}>Edit event</div>
                    <EventFormFields
                      form={editingCurrentEvent}
                      onChange={(next) =>
                        setEditingEvent({
                          observableId: editingEvent.observableId,
                          eventId: editingEvent.eventId,
                          form: next,
                        })
                      }
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => void handleUpdateEvent()} disabled={busyEventId === editingEvent.eventId}>
                        {busyEventId === editingEvent.eventId ? "Saving..." : "Save event"}
                      </button>
                      <button onClick={() => setEditingEvent(null)} disabled={busyEventId === editingEvent.eventId}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 600 }}>Add event</div>
                  <EventFormFields
                    form={addEventForm}
                    onChange={(next) => setEventForm(obs.id, next)}
                  />
                  <div>
                    <button
                      onClick={() => void handleCreateEvent(obs.id)}
                      disabled={busyEventId === obs.id}
                    >
                      {busyEventId === obs.id ? "Creating..." : "Add event"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventFormFields({
  form,
  onChange,
}: {
  form: EventForm;
  onChange: (next: EventForm) => void;
}) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <label style={labelStyle}>
          <span>Label</span>
          <input
            type="text"
            value={form.label}
            onChange={(e) => onChange({ ...form, label: e.target.value })}
            style={inputStyle}
            placeholder="Event name"
          />
        </label>
        <label style={labelStyle}>
          <span>Type</span>
          <select
            value={form.type}
            onChange={(e) => onChange({ ...form, type: e.target.value as EventType })}
            style={inputStyle}
          >
            {["PAST", "PLANNED", "OPTIMIZATION"].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <label style={labelStyle}>
          <span>Status</span>
          <select
            value={form.status}
            onChange={(e) => onChange({ ...form, status: e.target.value as EventStatus })}
            style={inputStyle}
          >
            {["PLANNED", "COMPLETED", "FAILED", "FIXED"].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          <span>Weight</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.weight}
            onChange={(e) => onChange({ ...form, weight: e.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>Sequence</span>
          <input
            type="number"
            min="0"
            value={form.sequence_index}
            onChange={(e) => onChange({ ...form, sequence_index: e.target.value })}
            style={inputStyle}
          />
        </label>
      </div>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <label style={labelStyle}>
          <span>Description (optional)</span>
          <input
            type="text"
            value={form.description ?? ""}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            style={inputStyle}
            placeholder="Short note"
          />
        </label>
        <label
          style={{
            ...labelStyle,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexDirection: "row",
            height: "100%",
            paddingTop: "1.5rem"
          }}
        >
          <input
            type="checkbox"
            checked={form.is_cutoff}
            onChange={(e) => onChange({ ...form, is_cutoff: e.target.checked })}
            style={{ width: "auto", margin: 0 }}
          />
          <span>Cutoff marker</span>
        </label>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.375rem",
  color: "var(--text-secondary)",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  // Handled by global CSS
};

function EventChain({ events }: { events: ObservableDetail["events"] }) {
  const width = 1000;
  const height = 140;
  const padding = 40;
  const count = Math.max(events.length, 1);
  const step = count > 1 ? (width - padding * 2) / (count - 1) : 0;
  const baseY = height / 2;
  const amplitude = 26;

  const pointColor = (event: ObservableDetail["events"][number]) => {
    const isRisk = event.status === "FAILED" || event.type === "OPTIMIZATION";
    const isPlanned = event.status === "PLANNED";
    const isCutoff = Boolean(event.is_cutoff);
    const strokeBase = isRisk ? "var(--error)" : isPlanned ? "var(--muted)" : "var(--text)";
    const stroke = isCutoff ? "var(--accent)" : strokeBase;
    const fill =
      isRisk || event.status === "COMPLETED" ? (isRisk ? "var(--error)" : "var(--text)") : "var(--bg-raised)";
    return { stroke, fill, isRisk, isPlanned, isCutoff };
  };

  const points = events.map((event, idx) => {
    const x = padding + idx * step;
    const y = baseY + Math.sin(idx) * amplitude;
    const radius = 8 + Math.min(Math.max(event.weight, 0.2), 2.5) * 6;
    const { stroke, fill, isRisk, isPlanned, isCutoff } = pointColor(event);
    return { x, y, radius, stroke, fill, isRisk, isPlanned, isCutoff, event };
  });

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem", background: "var(--bg-raised)", boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)" }}>
      {events.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: "0.875rem", textAlign: "center", padding: "2rem" }}>No events yet.</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Event chain" style={{ width: "100%", overflow: "visible" }}>
          {/* Removed rect background to be transparent */}
          {points.map((point, idx) => {
            const next = points[idx + 1];
            if (!next) return null;
            const stroke =
              point.isRisk || next.isRisk
                ? "var(--error)"
                : point.isCutoff || next.isCutoff
                  ? "var(--accent)"
                  : "var(--border)";
            const dash = point.isPlanned || next.isPlanned ? "4 4" : undefined;
            return (
              <line
                key={`line-${idx}`}
                x1={point.x}
                y1={point.y}
                x2={next.x}
                y2={next.y}
                stroke={stroke}
                strokeWidth={2}
                strokeDasharray={dash}
                opacity={0.8}
              />
            );
          })}
          {points.map((point, idx) => (
            <g key={`node-${point.event.id}-${idx}`} style={{ transition: "all 0.3s ease", cursor: "pointer" }}>
              <circle
                cx={point.x}
                cy={point.y}
                r={point.radius}
                fill={point.fill}
                stroke={point.stroke}
                strokeWidth={2.5}
                className="event-node"
              >
                <title>
                  {point.event.label} · {point.event.type} · {point.event.status}
                </title>
              </circle>
              {point.isCutoff && (
                <rect
                  x={point.x - (point.radius + 5)}
                  y={point.y - (point.radius + 5)}
                  width={(point.radius + 5) * 2}
                  height={(point.radius + 5) * 2}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.4}
                  transform={`rotate(45 ${point.x} ${point.y})`}
                  opacity={0.9}
                />
              )}
              {point.isPlanned && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={Math.max(point.radius - 6, 4)}
                  fill="transparent"
                  stroke={point.stroke}
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  opacity={0.6}
                />
              )}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
