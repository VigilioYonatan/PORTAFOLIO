import { contactUpdateDto } from "@modules/contact/dtos/contact.update.dto";
import { createZodDto } from "nestjs-zod";

export class ContactUpdateClassDto extends createZodDto(contactUpdateDto) {}
