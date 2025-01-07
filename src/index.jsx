import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const env = process.env;
const client = new ApolloClient({
  uri: `${env.REACT_APP_BACKEND_BASE_URL}/graphql`,
  // uri: `http://localhost:4000/graphql`,
  cache: new InMemoryCache(),
});

// "Access-Control-Allow-Origin": "*",
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
