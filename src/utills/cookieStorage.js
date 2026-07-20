import Cookies from "js-cookie";
export const getCookieStorage = key => {
  const value = Cookies.get(key);
  return value;
};
export const setCookieStorage = (key, value, options = {}) => {
  const defaults = {
    expires: 7,
    secure: true,
    sameSite: "Strict"
  };
  return Cookies.set(key, value, {
    ...defaults,
    ...options
  });
};
export const removeCookieStorage = key => {
  return Cookies.remove(key);
};
export const removeAllCookieStorage = () => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach(key => Cookies.remove(key));
};
