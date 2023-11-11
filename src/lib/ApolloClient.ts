import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import AppConstants from '_src/constants/Constant';

// export const apolloClient = new ApolloClient({
//   uri: AppConstants.BASE_GF_URL[0],
//   cache: new InMemoryCache(),
// });

export interface GQL_GamePlays_Result_DTO {}
export interface GQL_GamePlays_Result {
  gamePlays: GQL_GamePlays_Result_DTO[];
}

export const GQL_GamePlays = gql`
  query MyQuery($gameId: String!, $fromMove: String!) {
    gamePlays(where: { gameId: $gameId, fromMove_gte: $fromMove }, orderBy: fromMove) {
      moves
      fromMove
      nonce
      toMove
      transactionHash
    }
  }
`;
