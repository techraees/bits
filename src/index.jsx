import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { onError } from "@apollo/client/link/error";
import { ToastMessage } from "./components";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from,
  Observable, // Fixed Observable import for error link
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { REFRESH_TOKEN_MUTATION } from "./gql/mutations";
import { 
  getCookieStorage, 
  setCookieStorage, // Consistent storage utility
  removeCookieStorage 
} from "./utills/cookieStorage";

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

  // Returning an Observable instead of a Promise to fix the "retriedResult.subscribe" error
  return new Observable((observer) => {
    const tempClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });

    tempClient
      .mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { refresh_token },
      })
      .then(({ data }) => {
        const newAccessToken =
          data?.createNewAccessTokenFromRefreshToken?.access_token;
        if (newAccessToken) {
          // UPDATE: Saving to cookies, not localStorage (to keep it consistent)
          setCookieStorage("access_token", newAccessToken);

          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${newAccessToken}`,
            },
          });

          // Chain original request (and it must subscribe to fulfill the observable)
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };

          forward(operation).subscribe(subscriber);
        } else {
          removeCookieStorage("access_token");
          removeCookieStorage("refresh_token");
          window.location.href = "/login";
          observer.complete();
        }
      })
      .catch((error) => {
        removeCookieStorage("access_token");
        removeCookieStorage("refresh_token");
        window.location.href = "/login";
        observer.error(error);
      });
  });
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  let message;

  // GraphQL errors (status 200)
  if (graphQLErrors?.length) {
    message = graphQLErrors[0].message;
  }

  // Network errors (status 500)
  else if (networkError?.response?.errors?.length) {
    message = networkError.response.errors[0].message;
  }

  // Fallback
  else if (networkError?.message) {
    message = networkError.message;
  }

  if (message) {
    console.log("GLOBAL ERROR:", message);
    ToastMessage(message, "", "error");
  }

  console.log(message);
});

const client = new ApolloClient({
  // link: authLink.concat(httpLink),
  link: from([errorLink, refreshLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);

reportWebVitals();
