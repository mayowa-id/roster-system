'use client';

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs/ssr';
import { makeClient } from './apollo-client';

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
