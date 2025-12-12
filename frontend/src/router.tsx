import { createBrowserRouter, createMemoryRouter, Navigate, RouteObject } from "react-router-dom";

import { LayoutShell } from "./components/LayoutShell";
import { AlgorithmPage } from "./features/algorithm/AlgorithmPage";
import { LoginPage } from "./features/login/LoginPage";
import { ObservablesPage } from "./features/observables/ObservablesPage";
import { UtilityPage } from "./features/utility/UtilityPage";

export const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/dashboard",
    element: <LayoutShell />,
    children: [
      { index: true, element: <Navigate to="observables" replace /> },
      { path: "observables", element: <ObservablesPage /> },
      { path: "utility", element: <UtilityPage /> },
      { path: "algorithm", element: <AlgorithmPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
];

export const router = createBrowserRouter(routes);
export const memoryRouter = (initialEntries?: string[]) =>
  createMemoryRouter(routes, { initialEntries });
