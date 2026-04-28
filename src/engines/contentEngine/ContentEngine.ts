import { Content } from "../../domain/entities/Content";
import { IContentRepository } from "../../repositories/contentRepository/IContentRepository";
import { IContentEngine } from "./IContentEngine";
import { CreateContentVariablesDto } from "../../domain/dtos/content/CreateContentVariablesDto";
import { GetContentVariablesDto } from "../../domain/dtos/content/GetContentVariablesDto";
import { GetContentResponseDto } from "../../domain/dtos/content/GetContentResponseDto";
import { QUERY_GET_CONTENT } from "../../infrastructure/models/content/GET_CONTENT";
import { MUTATION_CREATE_CONTENT } from "../../infrastructure/models/content/CREATE_CONTENT";
import { MUTATION_APPROVE_CONTENT } from "../../infrastructure/models/content/APPROVE_CONTENT";
import { MUTATION_REJECT_CONTENT } from "../../infrastructure/models/content/REJECT_CONTENT";
import { MUTATION_CREATE_CONTENT_SLOT } from "../../infrastructure/models/content/CREATE_CONTENT_SLOT";
import { QUERY_GET_CONTENT_SLOT_BY_SUBJECT } from "../../infrastructure/models/content/GET_CONTENT_SLOT_BY_SUBJECT";
import { MUTATION_CREATE_CONTENT_SCHEDULE } from "../../infrastructure/models/content/CONTENT_SCHEDULE";

type ContentEngineConstructorParams = {
  ContentRepository: IContentRepository;
};

export default class ContentEngine implements IContentEngine {
  private contentRepository: IContentRepository;

  constructor({ ContentRepository }: ContentEngineConstructorParams) {
    this.contentRepository = ContentRepository;
  }

  async getContent(
    variables: GetContentVariablesDto,
    gqlToken: string
  ): Promise<GetContentResponseDto> {
    return this.contentRepository.list(QUERY_GET_CONTENT, variables, gqlToken);
  }

  async createContent(
    variables: CreateContentVariablesDto,
    gqlToken: string
  ): Promise<Content> {
    // 1. Get or Create Content Slot
    const slotResult = await this.contentRepository.getSlotBySubject(
      QUERY_GET_CONTENT_SLOT_BY_SUBJECT,
      { subject: variables.subject },
      gqlToken
    );

    let slotId;
    if (slotResult.allContentSlots.nodes.length > 0) {
      slotId = slotResult.allContentSlots.nodes[0].id;
    } else {
      const createSlotResult = await this.contentRepository.createSlot(
        MUTATION_CREATE_CONTENT_SLOT,
        { subject: variables.subject },
        gqlToken
      );
      slotId = createSlotResult.result.contentSlot.id;
    }

    // 2. Create Content
    const content = await this.contentRepository.create(
      MUTATION_CREATE_CONTENT,
      variables,
      gqlToken
    );

    // 3. Create Content Schedule
    await this.contentRepository.createSchedule(
      MUTATION_CREATE_CONTENT_SCHEDULE,
      {
        contentId: content.id,
        slotId: slotId,
        rotationOrder: 0,
        duration: variables.rotationDuration || 5,
      },
      gqlToken
    );

    return content;
  }

  async approveContent(
    id: string,
    approvedBy: string,
    gqlToken: string
  ): Promise<Content | null> {
    return this.contentRepository.approve(
      MUTATION_APPROVE_CONTENT,
      { id, approvedBy, approvedAt: new Date().toISOString() },
      gqlToken
    );
  }

  async rejectContent(
    id: string,
    rejectionReason: string,
    gqlToken: string
  ): Promise<Content | null> {
    return this.contentRepository.reject(
      MUTATION_REJECT_CONTENT,
      { id, rejectionReason },
      gqlToken
    );
  }

  resolveLiveContentRotation(liveContents: Content[]): Content[] {
    const subjectMap = new Map<string, Content[]>();
    for (const item of liveContents) {
      if (!subjectMap.has(item.subject)) {
        subjectMap.set(item.subject, []);
      }
      subjectMap.get(item.subject)?.push(item);
    }

    const resolved: Content[] = [];
    const nowEpoch = Date.now();

    for (const [, items] of subjectMap.entries()) {
      // Use localeCompare for UUID sorting
      items.sort((a, b) => a.id.localeCompare(b.id));

      let totalDurationMs = 0;
      for (const item of items) {
        totalDurationMs += (item.rotationDuration || 5) * 60 * 1000;
      }

      const cycleTime = nowEpoch % totalDurationMs;
      let accumulator = 0;
      let selectedItem = items[0];

      for (const item of items) {
        const dur = (item.rotationDuration || 5) * 60 * 1000;
        if (cycleTime >= accumulator && cycleTime < accumulator + dur) {
          selectedItem = item;
          break;
        }
        accumulator += dur;
      }
      resolved.push(selectedItem);
    }

    return resolved;
  }
}
