import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";

import { clearToken, setToken } from "../../lib/auth";
import {
  createObservable,
  createEvent,
  getObservable,
  listObservables,
} from "../../lib/observablesApi";
import { memoryRouter } from "../../router";

vi.mock("../../lib/observablesApi", () => ({
  listObservables: vi.fn(),
  getObservable: vi.fn(),
  createObservable: vi.fn(),
  updateObservable: vi.fn(),
  deleteObservable: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

const mockList = vi.mocked(listObservables);
const mockGet = vi.mocked(getObservable);
const mockCreate = vi.mocked(createObservable);
const mockCreateEvent = vi.mocked(createEvent);

beforeEach(() => {
  clearToken();
  setToken("fake-token");
  vi.clearAllMocks();
});

test("renders observables from API", async () => {
  mockList.mockResolvedValueOnce([
    {
      id: 1,
      name: "Person A",
      metadata: {},
      status: "STABLE",
      utility_x: 0.1,
      utility_y: 0.2,
      utility_distance: 0.22,
    },
  ]);
  mockGet.mockResolvedValueOnce({
    id: 1,
    name: "Person A",
    metadata: {},
    status: "STABLE",
    utility_x: 0.1,
    utility_y: 0.2,
    utility_distance: 0.22,
    events: [{ id: 1, observable_id: 1, label: "p1", weight: 0.3, status: "COMPLETED", type: "PAST", sequence_index: 0, is_cutoff: false }],
  });

  const router = memoryRouter(["/dashboard/observables"]);
  render(<RouterProvider router={router} />);

  await waitFor(() => expect(screen.getByText(/Person A/)).toBeInTheDocument());
  expect(screen.getByText(/Status: STABLE/)).toBeInTheDocument();
  expect(screen.getByText(/Utility x: 0.10/)).toBeInTheDocument();
});

test("creates observable via form", async () => {
  mockList.mockResolvedValueOnce([]);
  const created = {
    id: 2,
    name: "New Person",
    metadata: { cohort: "alpha" },
    status: "STABLE",
    utility_x: 0,
    utility_y: 0,
    utility_distance: 0,
    events: [],
  };
  mockCreate.mockResolvedValueOnce(created);

  const router = memoryRouter(["/dashboard/observables"]);
  render(<RouterProvider router={router} />);

  await waitFor(() => expect(screen.getByText(/No observables yet/i)).toBeInTheDocument());

  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Name/i), "New Person");
  await user.type(screen.getByLabelText(/Metadata/i), '{"cohort":"alpha"}');
  await user.click(screen.getByRole("button", { name: /Create observable/i }));

  await waitFor(() => expect(mockCreate).toHaveBeenCalled());
  expect(await screen.findByText(/New Person/)).toBeInTheDocument();
});

test("creates an event and refreshes observable", async () => {
  mockList.mockResolvedValueOnce([
    {
      id: 1,
      name: "Person A",
      metadata: {},
      status: "STABLE",
      utility_x: 0,
      utility_y: 0,
      utility_distance: 0,
    },
  ]);
  mockGet
    .mockResolvedValueOnce({
      id: 1,
      name: "Person A",
      metadata: {},
      status: "STABLE",
      utility_x: 0,
      utility_y: 0,
      utility_distance: 0,
      events: [],
    })
    .mockResolvedValueOnce({
      id: 1,
      name: "Person A",
      metadata: {},
      status: "STABLE",
      utility_x: 0.5,
      utility_y: 0.5,
      utility_distance: 0.7,
      events: [
        {
          id: 10,
          observable_id: 1,
          label: "ev1",
          weight: 1,
          status: "PLANNED",
          type: "PLANNED",
          sequence_index: 0,
          is_cutoff: false,
        },
      ],
    });
  mockCreateEvent.mockResolvedValueOnce({
    id: 10,
    observable_id: 1,
    label: "ev1",
    weight: 1,
    status: "PLANNED",
    type: "PLANNED",
    sequence_index: 0,
    is_cutoff: false,
  });

  const router = memoryRouter(["/dashboard/observables"]);
  render(<RouterProvider router={router} />);

  await waitFor(() => expect(screen.getByText(/Person A/)).toBeInTheDocument());
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Label/i), "ev1");
  await user.click(screen.getByRole("button", { name: /Add event/i }));

  await waitFor(() => expect(mockCreateEvent).toHaveBeenCalled());
  expect(await screen.findByText(/ev1/)).toBeInTheDocument();
});
