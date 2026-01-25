import { createZodDto } from "nestjs-zod";
import { technologyQueryDto } from "./technology.query.dto";

export class TechnologyQueryClassDto extends createZodDto(technologyQueryDto) {}
