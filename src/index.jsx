import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { onError } from "@apollo/client/link/error";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { REFRESH_TOKEN_MUTATION } from "./gql/mutations";
import { getCookieStorage } from "./utills/cookieStorage";

const env = process.env;

const httpLink = createHttpLink({
  uri: `${env.REACT_APP_BACKEND_BASE_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = getCookieStorage("access_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const refreshLink = onError(({ graphQLErrors, operation, forward }) => {
  const hasAuthError = graphQLErrors?.some(
    (err) =>
      err.extensions?.code === "UNAUTHENTICATED" ||
      err.message?.includes("expired") ||
      err.message?.includes("invalid token"),
  );

  if (!hasAuthError) return;

  const refresh_token = getCookieStorage("refresh_token");
  if (!refresh_token) return;

  // Apollo client just for token refresh
  const tempClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  return tempClient
    .mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refresh_token },
    })
    .then(({ data }) => {
      const newAccessToken = data?.refreshToken?.payload?.access_token;
      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);

        const oldHeaders = operation.getContext().headers;
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newAccessToken}`,
          },
        });

        // retry the original request
        return forward(operation);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    })
    .catch(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    });
});

const client = new ApolloClient({
  // link: authLink.concat(httpLink),
  link: from([refreshLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);

reportWebVitals();
