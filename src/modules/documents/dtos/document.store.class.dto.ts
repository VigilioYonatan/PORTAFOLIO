import { createZodDto } from "nestjs-zod";
import { documentStoreDto } from "./document.store.dto";

export class DocumentStoreClassDto extends createZodDto(documentStoreDto) {}
