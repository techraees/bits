export function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(func(...args)), delay);
    });
  };
}
