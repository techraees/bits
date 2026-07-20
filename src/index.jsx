import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { onError } from "@apollo/client/link/error";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from, Observable } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { REFRESH_TOKEN_MUTATION } from "./gql/mutations";
import { getCookieStorage, setCookieStorage, removeCookieStorage } from "./utills/cookieStorage";
const env = process.env;
const httpLink = createHttpLink({
  uri: `${env.REACT_APP_BACKEND_BASE_URL}/graphql`
});
const authLink = setContext((_, {
  headers
}) => {
  const cookieToken = getCookieStorage("access_token");
  // Prefer per-operation Authorization (e.g. password-reset JWT) over cookie.
  const existingAuth = headers?.authorization || headers?.Authorization;
  const authorization =
    existingAuth || (cookieToken ? `Bearer ${cookieToken}` : undefined);

  return {
    headers: {
      ...headers,
      ...(authorization ? { authorization } : {})
    }
  };
});
const refreshLink = onError(({
  graphQLErrors,
  operation,
  forward
}) => {
  const hasAuthError = graphQLErrors?.some(err => err.error_code === "ACCESS_TOKEN_EXPIRED" || err.extensions?.error_code === "ACCESS_TOKEN_EXPIRED" || err.message === "Access token expired");
  if (!hasAuthError) return;
  const refresh_token = getCookieStorage("refresh_token");
  if (!refresh_token) return;
  return new Observable(observer => {
    const tempClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    });
    tempClient.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        refresh_token
      }
    }).then(({
      data
    }) => {
      const newAccessToken = data?.createNewAccessTokenFromRefreshToken?.access_token;
      if (newAccessToken) {
        setCookieStorage("access_token", newAccessToken);
        const oldHeaders = operation.getContext().headers;
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newAccessToken}`
          }
        });
        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        };
        forward(operation).subscribe(subscriber);
      } else {
        removeCookieStorage("access_token");
        removeCookieStorage("refresh_token");
        window.location.href = "/login";
        observer.complete();
      }
    }).catch(error => {
      removeCookieStorage("access_token");
      removeCookieStorage("refresh_token");
      window.location.href = "/login";
      observer.error(error);
    });
  });
});
const errorLink = onError(({
  graphQLErrors
}) => {
  // Auth expiry is handled by refreshLink. Do NOT toast here —
  // screens already show their own ToastMessage, which caused duplicate toasts.
  const hasAuthError = graphQLErrors?.some(err => err.error_code === "ACCESS_TOKEN_EXPIRED" || err.extensions?.error_code === "ACCESS_TOKEN_EXPIRED" || err.message === "Access token expired");
  if (hasAuthError) return;
});
const client = new ApolloClient({
  link: from([errorLink, refreshLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache()
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ApolloProvider client={client}>
    <App />
  </ApolloProvider>);
reportWebVitals();
