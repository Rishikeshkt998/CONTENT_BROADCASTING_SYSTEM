import { ContentStatus } from "../../enums/ContentStatus";

export interface CreateContentVariablesDto {
  title: string;
  description?: string;
  subject: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  status: ContentStatus;
  startTime?: string | null;
  endTime?: string | null;
  rotationDuration?: number | null;
}
