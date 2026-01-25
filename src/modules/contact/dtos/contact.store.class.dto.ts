import { contactStoreDto } from "@modules/contact/dtos/contact.store.dto";
import { createZodDto } from "nestjs-zod";

export class ContactStoreClassDto extends createZodDto(contactStoreDto) {}
