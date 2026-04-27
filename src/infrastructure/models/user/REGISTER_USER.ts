export const MUTATION_CREATE_USER = `
  mutation CreateUser(
    $name: String!
    $email: String!
    $passwordHash: String!
    $role: String!
  ) {
    result: createUser(
      input: {
        user: {
          name: $name
          email: $email
          passwordHash: $passwordHash
          role: $role
        }
      }
    ) {
      user {
        id
        name
        email
        role
      }
    }
  }
`;
