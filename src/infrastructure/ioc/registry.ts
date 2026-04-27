import { asClass, createContainer, InjectionMode } from "awilix";
import { RedisService } from "../services/redis/RedisService";
import { S3Service } from "../services/s3/S3Service";

import AuthController from "../../controllers/AuthController";
import AuthEngine from "../../engines/authEngine/AuthEngine";
import UserRepository from "../../repositories/userRepository/UserRepository";
import { AuthUseCase } from "../../useCases/authUseCase/AuthUseCase";

import ContentController from "../../controllers/ContentController";
import ContentEngine from "../../engines/contentEngine/ContentEngine";
import ContentRepository from "../../repositories/contentRepository/ContentRepository";
import { ContentUseCase } from "../../useCases/contentUseCase/ContentUseCase";

export const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  // Auth
  AuthController: asClass(AuthController),
  AuthUseCase: asClass(AuthUseCase),
  AuthEngine: asClass(AuthEngine),
  UserRepository: asClass(UserRepository),

  // Content
  ContentController: asClass(ContentController),
  ContentUseCase: asClass(ContentUseCase),
  ContentEngine: asClass(ContentEngine),
  ContentRepository: asClass(ContentRepository),
  RedisService: asClass(RedisService).singleton(),
  S3Service: asClass(S3Service).singleton(),
});
