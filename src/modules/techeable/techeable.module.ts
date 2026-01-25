import { Module } from "@nestjs/common";
import { TecheableCache } from "./cache/techeable.cache";
import { TecheableController } from "./controllers/techeable.controller";
import { TecheableRepository } from "./repositories/techeable.repository";
import { TecheableService } from "./services/techeable.service";

@Module({
	controllers: [TecheableController],
	providers: [TecheableService, TecheableRepository, TecheableCache],
	exports: [TecheableService, TecheableRepository],
})
export class TecheableModule {}
