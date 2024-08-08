import { Navigate } from "react-router-dom";
import React from "react";

// configs
import { PATH } from "../configs/path";

function GuestRoutes({ children }: React.PropsWithChildren) {
  const isAccessToken = localStorage.getItem("token");

  if (isAccessToken) {
    return <Navigate to={PATH.ROOT} />;
  }

  return <>{children}</>;
}

export default GuestRoutes;
