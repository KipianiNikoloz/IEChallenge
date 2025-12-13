import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";

import { clearToken, getToken } from "./lib/auth";
import { memoryRouter } from "./router";

vi.mock("./lib/apiClient", () => ({
  post: vi.fn().mockResolvedValue({ access_token: "fake-token", token_type: "bearer" }),
}));

beforeEach(() => {
  clearToken();
});

test("renders login page by default", () => {
  const router = memoryRouter(["/"]);
  render(<RouterProvider router={router} />);
  expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
});

test("login stores token and redirects", async () => {
  const router = memoryRouter(["/login"]);
  render(<RouterProvider router={router} />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/Username/i), "admin");
  await user.type(screen.getByLabelText(/Password/i), "admin");
  await user.click(screen.getByRole("button", { name: /Sign in/i }));

  await waitFor(() => expect(getToken()).toBe("fake-token"));
});
