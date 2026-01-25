import { createZodDto } from "nestjs-zod";
import {
	techeableDestroyResponseDto,
	techeableStoreResponseDto,
} from "./techeable.response.dto";

export class TecheableStoreResponseClassDto extends createZodDto(
	techeableStoreResponseDto,
) {}

export class TecheableDestroyResponseClassDto extends createZodDto(
	techeableDestroyResponseDto,
) {}
