export const MUTATION_CREATE_CONTENT = `
  mutation CreateContent(
    $title: String!
    $description: String
    $subject: String!
    $fileUrl: String!
    $fileType: String!
    $fileSize: BigInt!
    $uploadedBy: Int!
    $status: Int!
    $startTime: Datetime
    $endTime: Datetime
    $rotationDuration: Int
  ) {
    result: createContent(
      input: {
        content: {
          title: $title
          description: $description
          subject: $subject
          fileUrl: $fileUrl
          fileType: $fileType
          fileSize: $fileSize
          uploadedBy: $uploadedBy
          status: $status
          startTime: $startTime
          endTime: $endTime
          rotationDuration: $rotationDuration
        }
      }
    ) {
      content {
        id
        title
        subject
        fileUrl
        status
        createdAt
      }
    }
  }
`;
