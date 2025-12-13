import { destroy, get, patch, post } from "./apiClient";

export type ObservableStatus = "STABLE" | "AT_RISK" | "OPTIMIZED";
export type EventStatus = "FIXED" | "PLANNED" | "COMPLETED" | "FAILED";
export type EventType = "PAST" | "PLANNED" | "OPTIMIZATION";

export type EventRead = {
  id: number;
  observable_id: number;
  type: EventType;
  status: EventStatus;
  label: string;
  description?: string | null;
  sequence_index: number;
  is_cutoff: boolean;
  weight: number;
  timestamp?: string | null;
};

export type ObservableSummary = {
  id: number;
  name: string;
  metadata: Record<string, unknown>;
  status: ObservableStatus;
  utility_x: number;
  utility_y: number;
  utility_distance: number;
};

export type ObservableDetail = ObservableSummary & {
  events: EventRead[];
};

export type ObservableCreatePayload = {
  name: string;
  metadata: Record<string, unknown>;
  status: ObservableStatus;
};

export type ObservableUpdatePayload = Partial<ObservableCreatePayload>;

export type EventCreatePayload = {
  label: string;
  type: EventType;
  status: EventStatus;
  description?: string;
  sequence_index: number;
  is_cutoff?: boolean;
  weight: number;
  timestamp?: string | null;
};

export type EventUpdatePayload = Partial<EventCreatePayload>;

export async function listObservables(): Promise<ObservableSummary[]> {
  return get<ObservableSummary[]>("/observables");
}

export async function getObservable(id: number): Promise<ObservableDetail> {
  return get<ObservableDetail>(`/observables/${id}`);
}

export async function createObservable(
  payload: ObservableCreatePayload,
): Promise<ObservableDetail> {
  return post<ObservableDetail>("/observables", payload);
}

export async function updateObservable(
  id: number,
  payload: ObservableUpdatePayload,
): Promise<ObservableDetail> {
  return patch<ObservableDetail>(`/observables/${id}`, payload);
}

export async function deleteObservable(id: number): Promise<void> {
  await destroy(`/observables/${id}`);
}

export async function createEvent(
  observableId: number,
  payload: EventCreatePayload,
): Promise<EventRead> {
  return post<EventRead>(`/observables/${observableId}/events`, payload);
}

export async function updateEvent(eventId: number, payload: EventUpdatePayload): Promise<EventRead> {
  return patch<EventRead>(`/observables/events/${eventId}`, payload);
}

export async function deleteEvent(eventId: number): Promise<void> {
  await destroy(`/observables/events/${eventId}`);
}
