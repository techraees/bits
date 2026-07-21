import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import { Loader } from "../components";
import routes from "../route";
import { trimAfterFirstSlash } from "../utills/reusableFunctions";
import { getCookieStorage } from "../utills/cookieStorage";
import { GET_PROFILE } from "../gql/queries";
import { profileToUserData } from "../utills/hydrateUserProfile";
export const useProtectedRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const validRoutes = routes?.map((route) => trimAfterFirstSlash(route?.path));
  const token = getCookieStorage("access_token");
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_PROFILE, {
    variables: {
      token,
    },
    skip: !token,
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    if (queryLoading) return;
    if (data?.GetProfile) {
      setIsAuthenticated(true);
      dispatch({
        type: "NFT_ADDRESS",
        userData: profileToUserData(data.GetProfile),
      });
    } else {
      setIsAuthenticated(false);
    }
    if (error) {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [data, error, queryLoading, token, dispatch]);
  useEffect(() => {
    if (!validRoutes) return;
    if (!validRoutes?.includes(trimAfterFirstSlash(location?.pathname))) {
      navigate("/404");
    }
  }, [validRoutes]);
  const Protected = ({ redirectPath = "/", children }) => {
    if (loading) return <Loader content="authenticating..." />;
    if (isAuthenticated) return children;
    return (
      <Navigate
        to={redirectPath}
        state={{
          from: location,
        }}
        replace
      />
    );
  };
  const Public = ({ redirectPath = "/", children }) => {
    if (loading) return <Loader content="authenticating..." />;
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || redirectPath;
      return <Navigate to={from} replace />;
    }
    return children;
  };
  return {
    Protected,
    Public,
  };
};
