import { createZodDto } from "nestjs-zod";
import { openSourceStoreDto } from "./open-source.store.dto";

export class OpenSourceStoreClassDto extends createZodDto(openSourceStoreDto) {}
