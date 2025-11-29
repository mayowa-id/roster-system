import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
      fetchOptions: { cache: 'no-store' },
    }),
  });
}