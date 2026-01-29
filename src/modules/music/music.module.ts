import { Module } from "@nestjs/common";
import { MusicTrackCache } from "./cache/music.cache";
import { MusicController } from "./controllers/music.controller";
import { MusicTrackRepository } from "./repositories/music.repository";
import { MusicService } from "./services/music.service";

@Module({
	providers: [MusicService, MusicTrackRepository, MusicTrackCache],
	controllers: [MusicController],
	exports: [MusicService, MusicTrackRepository, MusicTrackCache],
})
export class MusicModule {}
