export const QUERY_GET_USER = `
  query GetUser(
    $email: String
    $id: Int
  ) {
    result: allUsers(
      filter: {
        email: { equalTo: $email }
        id: { equalTo: $id }
      }
    ) {
      nodes {
        id
        name
        email
        passwordHash
        role
        createdAt
        updatedAt
      }
    }
  }
`;
