import { createZodDto } from "nestjs-zod";
import { projectUpdateDto } from "./project.update.dto";

export class ProjectUpdateClassDto extends createZodDto(projectUpdateDto) {}
