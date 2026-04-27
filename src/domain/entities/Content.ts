import { ContentStatus } from '../enums/ContentStatus';

export interface Content {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  status: ContentStatus;
  start_time: Date | null;
  end_time: Date | null;
  rotation_duration: number | null;
  approved_by: number | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
  teacher_name?: string; // Optional field used in joins
}
