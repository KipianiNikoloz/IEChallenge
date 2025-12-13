import { render, screen, waitFor } from "@testing-library/react";

import { get } from "../../lib/apiClient";
import { UtilityPage } from "./UtilityPage";

vi.mock("../../lib/apiClient", () => ({
  get: vi.fn(),
}));

const mockGet = vi.mocked(get);

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders metrics and charts when data is available", async () => {
  mockGet
    .mockResolvedValueOnce({
      average_distance: 0.8,
      percent_below_cutoff: 0.25,
      system_stability_index: 0.75,
      total_observables: 2,
    })
    .mockResolvedValueOnce([
      { id: 1, utility_x: 0.5, utility_y: 0.4, utility_distance: 0.64, status: "STABLE" },
      { id: 2, utility_x: 1.2, utility_y: 0.9, utility_distance: 1.5, status: "OPTIMIZED" },
    ]);

  render(<UtilityPage />);

  await waitFor(() => expect(screen.getByText(/Total observables/)).toBeInTheDocument());
  expect(screen.getByText(/0.80/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Utility scatter plot/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Utility histogram/i)).toBeInTheDocument();
});

test("shows error state when request fails", async () => {
  mockGet.mockRejectedValueOnce(new Error("fail"));
  render(<UtilityPage />);
  await waitFor(() => expect(screen.getByText(/Unable to load utility data/i)).toBeInTheDocument());
});
