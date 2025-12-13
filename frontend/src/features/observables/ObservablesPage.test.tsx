import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";

import { clearToken, setToken } from "../../lib/auth";
import { memoryRouter } from "../../router";

vi.mock("../../lib/apiClient", () => ({
  get: vi
    .fn()
    .mockResolvedValueOnce([{ id: 1, name: "Person A", status: "STABLE", utility_x: 0.1, utility_y: 0.2, utility_distance: 0.22 }])
    .mockResolvedValueOnce({ events: [{ id: 1, label: "p1", weight: 0.3, status: "COMPLETED", type: "PAST" }] }),
}));

beforeEach(() => {
  clearToken();
  setToken("fake-token");
});

test("renders observables from API", async () => {
  const router = memoryRouter(["/dashboard/observables"]);
  render(<RouterProvider router={router} />);

  await waitFor(() => expect(screen.getByText(/Person A/)).toBeInTheDocument());
  expect(screen.getByText(/Status: STABLE/)).toBeInTheDocument();
  expect(screen.getByText(/x: 0.10/)).toBeInTheDocument();
});
