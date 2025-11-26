import Cookies from "js-cookie";

/**
 * ✅ Get a cookie value
 */
export const getCookieStorage = (key) => {
  const value = Cookies.get(key);
  // window.dispatchEvent(new Event("storageChange"));
  return value;
};

/**
 * ✅ Set a cookie value
 * expires: days before expiration (default = 7)
 * secure: true for HTTPS only
 * sameSite: 'Strict' to prevent CSRF
 */
export const setCookieStorage = (key, value, options = {}) => {
  const defaults = { expires: 7, secure: true, sameSite: "Strict" };
  return Cookies.set(key, value, { ...defaults, ...options });
};

/**
 * ✅ Remove a specific cookie
 */
export const removeCookieStorage = (key) => {
  return Cookies.remove(key);
};

/**
 * ✅ Remove all cookies (manual loop since js-cookie has no clearAll)
 */
export const removeAllCookieStorage = () => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((key) => Cookies.remove(key));
};
