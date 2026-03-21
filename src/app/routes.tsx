import { createHashRouter } from "react-router";
import Root from "./Root";
import { Dashboard } from "./components/Dashboard";
import { ServiceRegistration } from "./components/ServiceRegistration";
import { CollectionStatus } from "./components/CollectionStatus";
import { Clients } from "./components/Clients";
import { AdminProfile } from "./components/AdminProfile";
import { ExpensesManager } from "./components/ExpensesManager";
import { RouteErrorPage } from "./components/RouteErrorPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: Dashboard },
      { path: "registro", Component: ServiceRegistration },
      { path: "cobros", Component: CollectionStatus },
      { path: "clientes", Component: Clients },
      { path: "perfil", Component: AdminProfile },
      { path: "gastos", Component: ExpensesManager },
    ],
  },
]);
