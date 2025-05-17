import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import routes from "../../route";
import { useProtectedRoutes } from "../../hooks/useProtectedRoutes";

const PublicLayout = () => {
  const { Public } = useProtectedRoutes();
  const location = useLocation();
  const publicRoutes = ["/login", "/reset-password", "/reset-password/success"];
  return (
    <>
      <Routes>
        {routes
          ?.filter((r) => r?.layout === "public")
          ?.map((route) => (
            <>
              {route?.nested ? (
                <Route
                  key={route.key}
                  path={route.path}
                  element={
                    publicRoutes?.includes(location?.pathname) ? (
                      <Public> {route?.component}</Public>
                    ) : (
                      route?.component
                    )
                  }
                >
                  {route?.nestedRoutes?.map((nestedRoute, i) => (
                    <Route
                      key={i}
                      index={nestedRoute?.index}
                      element={
                        publicRoutes?.includes(location?.pathName) ? (
                          <Public> {nestedRoute?.component}</Public>
                        ) : (
                          nestedRoute?.component
                        )
                      }
                      path={nestedRoute?.path}
                    />
                  ))}
                </Route>
              ) : (
                <Route
                  path={route?.path}
                  element={
                    publicRoutes?.includes(location?.pathname) ? (
                      <Public> {route?.component}</Public>
                    ) : (
                      route?.component
                    )
                  }
                />
              )}
            </>
          ))}
      </Routes>
    </>
  );
};

export default PublicLayout;
