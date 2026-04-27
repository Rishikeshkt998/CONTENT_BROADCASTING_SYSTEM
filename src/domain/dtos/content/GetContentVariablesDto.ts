import { ContentStatus } from "../../enums/ContentStatus";

export interface GetContentVariablesDto {
  id?: string;
  uploadedBy?: string;
  status?: ContentStatus;
  subject?: string;
  startTimeLte?: string;
  endTimeGte?: string;
  first?: number;
  offset?: number;
}
