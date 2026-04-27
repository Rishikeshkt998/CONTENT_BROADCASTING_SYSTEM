import { ContentStatus } from '../enums/ContentStatus';

export interface Content {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  status: ContentStatus;
  startTime: string | null;
  endTime: string | null;
  rotationDuration: number | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  teacherName?: string;
}
