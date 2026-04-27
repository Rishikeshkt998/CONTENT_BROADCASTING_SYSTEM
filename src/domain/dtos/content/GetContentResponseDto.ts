import { Content } from "../../entities/Content";

export interface GetContentResponseDto {
  data: Content[];
  totalCount?: number;
}
