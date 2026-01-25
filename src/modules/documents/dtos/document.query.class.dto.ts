import { createZodDto } from "nestjs-zod";
import { documentQueryDto } from "./document.query.dto";

export class DocumentQueryClassDto extends createZodDto(documentQueryDto) {}
