import { createZodDto } from "nestjs-zod";
import { projectQueryDto } from "./project.query.dto";

export class ProjectQueryClassDto extends createZodDto(projectQueryDto) {}
