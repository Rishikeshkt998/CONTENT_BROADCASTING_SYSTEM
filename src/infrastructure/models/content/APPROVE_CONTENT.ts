export const MUTATION_APPROVE_CONTENT = `
  mutation ApproveContent(
    $id: UUID!
    $approvedBy: Int!
    $approvedAt: Datetime!
  ) {
    result: updateContentById(
      input: {
        id: $id
        contentPatch: {
          status: 2
          approvedBy: $approvedBy
          approvedAt: $approvedAt
        }
      }
    ) {
      content {
        id
        title
        status
        approvedBy
        approvedAt
      }
    }
  }
`;
