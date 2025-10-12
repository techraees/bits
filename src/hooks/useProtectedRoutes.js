/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Loader } from "../components";
import routes from "../route";
import { trimAfterFirstSlash } from "../utills/reusableFunctions";
import { getCookieStorage } from "../utills/cookieStorage";
import { GET_PROFILE } from "../gql/queries";

export const useProtectedRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const validRoutes = routes?.map((route) => trimAfterFirstSlash(route?.path));
  const token = getCookieStorage("access_token");

  // Apollo Query to verify profile
  const { data, loading: queryLoading, error } = useQuery(GET_PROFILE, {
    variables: { token },
    skip: !token,
    fetchPolicy: "network-only",
  });

  // Update auth state once verification completes
  useEffect(() => {
    if (queryLoading) return;

    if (data?.GetProfile) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    if (error) {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, [data, error, queryLoading]);

  // Validate allowed routes
  useEffect(() => {
    if (!validRoutes) return;
    if (!validRoutes?.includes(trimAfterFirstSlash(location?.pathname))) {
      navigate("/404");
    }
  }, [validRoutes]);

  // ✅ Protected route wrapper
  const Protected = ({ redirectPath = "/login", children }) => {
    if (loading) return <Loader content="authenticating..." />;

    // If authenticated → stay on current page (no forced redirect)
    if (isAuthenticated) return children;

    // Only redirect to login if not authenticated
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  };

  // ✅ Public route wrapper
  const Public = ({ redirectPath = "/", children }) => {
    if (loading) return <Loader content="authenticating..." />;

    // If user is authenticated and already on /login or /signup → stay where they came from
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || redirectPath;
      return <Navigate to={from} replace />;
    }

    return children;
  };

  return { Protected, Public };
};
