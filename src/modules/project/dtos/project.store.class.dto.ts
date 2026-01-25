import { createZodDto } from "nestjs-zod";
import { projectStoreDto } from "./project.store.dto";

export class ProjectStoreClassDto extends createZodDto(projectStoreDto) {}
