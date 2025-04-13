import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const CURRENT_USER_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      createdAt
      updatedAt
    }
  }
`;