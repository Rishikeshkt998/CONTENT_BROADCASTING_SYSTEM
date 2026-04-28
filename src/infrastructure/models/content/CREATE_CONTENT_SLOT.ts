export const MUTATION_CREATE_CONTENT_SLOT = `
  mutation CreateContentSlot($subject: String!) {
    result: createContentSlot(input: { contentSlot: { subject: $subject } }) {
      contentSlot {
        id
        subject
      }
    }
  }
`;
