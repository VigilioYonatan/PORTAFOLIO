import { createZodDto } from "nestjs-zod";
import { contactQueryDto } from "./contact.query.dto";

export class ContactQueryClassDto extends createZodDto(contactQueryDto) {}
