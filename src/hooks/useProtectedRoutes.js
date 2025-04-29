/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getStorage } from "../utills/localStorage";
import { Loader } from "../components";
import routes from "../route";
import { trimAfterFirstSlash } from "../utills/reusableFunctions";

export const useProtectedRoutes = () => {
  const { userData } = useSelector((state) => state.address.userData);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const validRoutes = routes?.map((route) => trimAfterFirstSlash(route?.path));
  let token = getStorage("token");

  useEffect(() => {
    if (token && userData) {
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [userData, token]);

  useEffect(() => {
    if (!validRoutes) return;
    if (!validRoutes?.includes(trimAfterFirstSlash(location?.pathname)))
      return navigate("/404");
  }, [validRoutes]);

  const Protected = ({ redirectPath = "/login", children }) => {
    return loading ? (
      <Loader content="authenticating..." />
    ) : isAuthenticated ? (
      children
    ) : (
      <Navigate to={redirectPath} />
    );
  };

  const Public = ({ redirectPath = "/", children }) => {
    return <>{!isAuthenticated ? children : <Navigate to={redirectPath} />}</>;
  };

  return { Protected, Public };
};
