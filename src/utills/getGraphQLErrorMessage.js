/** Prefer GraphQL body message over Apollo's HTTP status string. */
function getGraphQLErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.graphQLErrors?.[0]?.message ||
    error?.networkError?.result?.errors?.[0]?.message ||
    error?.networkError?.result?.message ||
    (typeof error?.message === "string" &&
    !/^Response not successful:/i.test(error.message)
      ? error.message
      : null) ||
    fallback
  );
}

export default getGraphQLErrorMessage;
