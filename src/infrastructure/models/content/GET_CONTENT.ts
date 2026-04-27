export const QUERY_GET_CONTENT = `
  query GetContent(
    $id: UUID
    $uploadedBy: UUID
    $status: Int
    $subject: String
    $startTimeLte: Datetime
    $endTimeGte: Datetime
    $orderBy: [ContentsOrderBy!]
    $first: Int
    $offset: Int
  ) {
    result: allContents(
      filter: {
        id: { equalTo: $id }
        uploadedBy: { equalTo: $uploadedBy }
        status: { equalTo: $status }
        subject: { equalTo: $subject }
        startTime: { lessThanOrEqualTo: $startTimeLte }
        endTime: { greaterThanOrEqualTo: $endTimeGte }
      }
      orderBy: $orderBy
      first: $first
      offset: $offset
    ) {
      nodes {
        id
        title
        description
        subject
        fileUrl
        fileType
        fileSize
        status
        startTime
        endTime
        rotationDuration
        uploadedBy
        approvedBy
        approvedAt
        rejectionReason
        createdAt
        userByUploadedBy {
          id
          name
          email
        }
      }
      totalCount
    }
  }
`;
