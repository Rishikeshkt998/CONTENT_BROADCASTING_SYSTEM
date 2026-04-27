import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import logger from "../logging/winston/AppLogger";

const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_URI || "http://localhost:4000/graphql",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      const errorMessage = `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`;
      logger.error(errorMessage);
    });
  }
  if (networkError) {
    logger.error(`[Network error]: ${networkError}`);
  }
});

const apolloClient = (token: string) => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ?? "",
      },
    };
  });
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink.concat(httpLink)]),
  });
};

export default apolloClient;
