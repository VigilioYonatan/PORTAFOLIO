import { Module } from "@nestjs/common";
import { MusicTrackCache } from "./cache/music.cache";
import { MusicTrackController } from "./controllers/music.controller";
import { MusicTrackRepository } from "./repositories/music.repository";
import { MusicTrackSeeder } from "./seeders/music.seeder";
import { MusicTrackService } from "./services/music.service";

@Module({
	controllers: [MusicTrackController],
	providers: [
		MusicTrackService,
		MusicTrackRepository,
		MusicTrackCache,
		MusicTrackSeeder,
	],
	exports: [MusicTrackService, MusicTrackSeeder],
})
export class MusicTrackModule {}
