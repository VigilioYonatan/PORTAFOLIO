import { schema } from "@infrastructure/providers/database/database.schema";
import { DRIZZLE } from "@infrastructure/providers/database/database.service";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq, type InferInsertModel } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { musicTrackEntity } from "../entities/music.entity";

type TrackData = Omit<
	InferInsertModel<typeof musicTrackEntity>,
	"id" | "tenant_id" | "created_at" | "updated_at"
>;

@Injectable()
export class MusicTrackSeeder {
	constructor(
		@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async run(tenant_id: number) {
		const tracksData = [
			{
				title: "Synthwave Breeze",
				artist: "Digital Wanderer",
				duration_seconds: 180,
				sort_order: 1,
				is_featured: true,
				is_public: true,
				audio_file: [
					{
						key: "music/track1.mp3",
						name: "track1.mp3",
						original_name: "track1.mp3",
						size: 5000000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [
					{
						key: "music/cover1.jpg",
						name: "cover1.jpg",
						original_name: "cover1.jpg",
						size: 200000,
						mimetype: "image/jpeg",
					},
				],
			},
			{
				title: "Neon Dreams",
				artist: "Cyber Echo",
				duration_seconds: 210,
				sort_order: 2,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/track2.mp3",
						name: "track2.mp3",
						original_name: "track2.mp3",
						size: 6000000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Midnight Drive",
				artist: "Retro Wave",
				duration_seconds: 150,
				sort_order: 3,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/track3.mp3",
						name: "track3.mp3",
						original_name: "track3.mp3",
						size: 4000000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
		];

		const tracks: TrackData[] = tracksData;

		for (const track of tracks) {
			const exists = await this.db.query.musicTrackEntity.findFirst({
				where: and(
					eq(musicTrackEntity.tenant_id, tenant_id),
					eq(musicTrackEntity.title, track.title),
				),
			});

			if (!exists) {
				await this.db.insert(musicTrackEntity).values({ ...track, tenant_id });
			}
		}
	}
}
