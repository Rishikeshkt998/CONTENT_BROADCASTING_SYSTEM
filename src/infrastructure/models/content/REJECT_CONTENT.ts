export const MUTATION_REJECT_CONTENT = `
  mutation RejectContent(
    $id: UUID!
    $rejectionReason: String!
  ) {
    result: updateContentById(
      input: {
        id: $id
        contentPatch: {
          status: 3
          rejectionReason: $rejectionReason
        }
      }
    ) {
      content {
        id
        title
        status
        rejectionReason
      }
    }
  }
`;
