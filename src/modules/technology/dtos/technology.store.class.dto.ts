import { createZodDto } from "nestjs-zod";
import { technologyStoreDto } from "./technology.store.dto";

export class TechnologyStoreClassDto extends createZodDto(technologyStoreDto) {}
