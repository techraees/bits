import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "../../route";
import { useProtectedRoutes } from "../../hooks/useProtectedRoutes";

const PrivateLayout = () => {
  const { Protected } = useProtectedRoutes();
  return (
    <>
      <Routes>
        {routes
          ?.filter((r) => r?.layout === "private")
          ?.map((route) => (
            <>
              {route?.nested ? (
                <Route
                  key={route.key}
                  path={route?.path}
                  element={route?.component}
                >
                  {route?.nestedRoutes?.map((nestedRoute, i) => (
                    <Route
                      key={i}
                      index={nestedRoute?.index}
                      element={<Protected>{nestedRoute?.component}</Protected>}
                      path={nestedRoute?.path}
                    />
                  ))}
                </Route>
              ) : (
                <Route
                  path={route?.path}
                  element={<Protected>{route?.component}</Protected>}
                />
              )}
            </>
          ))}
      </Routes>
    </>
  );
};

export default PrivateLayout;
