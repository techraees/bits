export function trimAfterFirstSlash(input) {
  const parts = input.split("/"); // Split the input string by '/'
  if (parts.length > 1) {
    return `/${parts[1]}`; // Return the first meaningful part after the leading slash
  }
  return input; // If input doesn't need trimming, return it unchanged
}
