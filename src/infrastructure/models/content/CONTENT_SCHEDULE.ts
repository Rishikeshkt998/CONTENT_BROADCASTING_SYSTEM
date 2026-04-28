export const MUTATION_CREATE_CONTENT_SCHEDULE = `
  mutation CreateContentSchedule(
    $contentId: UUID!
    $slotId: UUID!
    $rotationOrder: Int!
    $duration: Int!
  ) {
    result: createContentSchedule(
      input: {
        contentSchedule: {
          contentId: $contentId
          slotId: $slotId
          rotationOrder: $rotationOrder
          duration: $duration
        }
      }
    ) {
      contentSchedule {
        id
        contentId
        slotId
      }
    }
  }
`;
