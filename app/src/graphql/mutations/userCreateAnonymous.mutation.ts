import { gql } from "@apollo/client";

export const USER_CREATE_ANONYMOUS_MUTATION = gql`
  mutation UserCreateAnonymous($input: UserCreateAnonymousGqlInput) {
    userCreateAnonymous(input: $input) {
      accessToken
      user {
        id
        username
        roles
      }
    }
  }
`;
