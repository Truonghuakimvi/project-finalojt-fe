import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SideBar from "./components/SideBar";

// configs
import { PATH } from "./configs/path";

// routes
import AuthRoutes from "./routes/auth-routes";
import GuestRoutes from "./routes/guest-routes";
import Loading from "./pages/Status/loading";
import Notfound from "./pages/Status/notfound";

// component
const Skill = React.lazy(() =>
  import("./pages/Skill/index").then((module) => ({
    default: module.default,
  }))
);
const Project = React.lazy(() =>
  import("./pages/Project/index").then((module) => ({
    default: module.default,
  }))
);
const Position = React.lazy(() =>
  import("./pages/Position/index").then((module) => ({
    default: module.default,
  }))
);
const Login = React.lazy(() =>
  import("./pages/Login/index").then((module) => ({
    default: module.default,
  }))
);
const Employee = React.lazy(() =>
  import("./pages/Employee/index").then((module) => ({
    default: module.default,
  }))
);
const Account = React.lazy(() =>
  import("./pages/Account/index").then((module) => ({
    default: module.default,
  }))
);
const Profile = React.lazy(() =>
  import("./pages/Profile/index").then((module) => ({
    default: module.default,
  }))
);
const ProjectDetail = React.lazy(() =>
  import("./pages/ProjectDetail/index").then((module) => ({
    default: module.default,
  }))
);

const routesConfig = [
  {
    path: PATH.SKILL,
    element: Skill,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.PROJECT,
    element: Project,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: `${PATH.PROJECT}/:id`,
    element: ProjectDetail,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.POSITION,
    element: Position,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.EMPLOYEE,
    element: Employee,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.ACCOUNT,
    element: Account,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.PROFILE,
    element: Profile,
    guard: AuthRoutes,
    layout: SideBar,
  },
  {
    path: PATH.LOGIN,
    element: Login,
    guard: GuestRoutes,
  },
  {
    path: PATH.PROFILE,
    element: Profile,
    guard: AuthRoutes,
    layout: SideBar,
  },
];

const AppLayout: React.FC = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/project" />} />

          {routesConfig.map((route) => {
            const Guard = route.guard || React.Fragment;
            const Layout = route.layout || React.Fragment;
            const Component = route.element;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Guard>
                    <Layout>
                      <Component />
                    </Layout>
                  </Guard>
                }
              >
                <Route
                  key={route.path}
                  path={route.path}
                  element={<Component />}
                />
              </Route>
            );
          })}
          <Route path="*" element={<Notfound />} />
        </Routes>
      </React.Suspense>
    </div>
  </div>
);
export default AppLayout;
  