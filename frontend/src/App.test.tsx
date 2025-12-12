import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";

import { memoryRouter } from "./router";

test("renders login page by default", () => {
  const router = memoryRouter(["/"]);
  render(<RouterProvider router={router} />);
  expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
});
