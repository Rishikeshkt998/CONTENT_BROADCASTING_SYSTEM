export const QUERY_GET_CONTENT_SLOT_BY_SUBJECT = `
  query GetContentSlotBySubject($subject: String!) {
    contentSlots(condition: { subject: $subject }) {
      nodes {
        id
        subject
      }
    }
  }
`;
