export function trimAfterFirstSlash(input) {
  const parts = input.split("/");
  if (parts.length > 1) {
    return `/${parts[1]}`;
  }
  return input;
}
