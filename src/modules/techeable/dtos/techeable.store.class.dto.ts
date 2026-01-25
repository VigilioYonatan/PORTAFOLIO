import { createZodDto } from "nestjs-zod";
import { techeableStoreDto } from "./techeable.store.dto";

export class TecheableStoreClassDto extends createZodDto(techeableStoreDto) {}
