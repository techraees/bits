export const getStorage = (key) => {
  const value =  localStorage.getItem(key);
  window.dispatchEvent(new Event("storageChange"));
  return value  
};
export const setStorage = (key, value) => {
  return localStorage.setItem(key, value);
};

export const removeStorage = (key) => {
  return localStorage.removeItem(key);
};

export const removeAllStorage = () => {
  return localStorage.clear();
};
