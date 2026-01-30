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
			{
				title: "Get Lost",
				artist: "Rome in Silver",
				duration_seconds: 259,
				sort_order: 4,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/get-lost.mp3",
						name: "get-lost.mp3",
						original_name: "get-lost.mp3",
						size: 4500000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "All You Need",
				artist: "Blooom & Maksim",
				duration_seconds: 233,
				sort_order: 5,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/all-you-need.mp3",
						name: "all-you-need.mp3",
						original_name: "all-you-need.mp3",
						size: 5200000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Eastern Thug",
				artist: "KOAN Sound",
				duration_seconds: 307,
				sort_order: 6,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/eastern-thug.mp3",
						name: "eastern-thug.mp3",
						original_name: "eastern-thug.mp3",
						size: 5800000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "0506+056 (Opiuo Remix)",
				artist: "Deathpact",
				duration_seconds: 119,
				sort_order: 7,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/0506-056-remix.mp3",
						name: "0506-056-remix.mp3",
						original_name: "0506-056-remix.mp3",
						size: 5100000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "CATALYST (REAPER Remix)",
				artist: "Deathpact",
				duration_seconds: 228,
				sort_order: 8,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/catalyst-remix.mp3",
						name: "catalyst-remix.mp3",
						original_name: "catalyst-remix.mp3",
						size: 4400000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "CODE 10-31",
				artist: "Karma Fields",
				duration_seconds: 242,
				sort_order: 9,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/code-10-31.mp3",
						name: "code-10-31.mp3",
						original_name: "code-10-31.mp3",
						size: 7200000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Riftwalk",
				artist: "Bustre",
				duration_seconds: 388,
				sort_order: 10,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/riftwalk.mp3",
						name: "riftwalk.mp3",
						original_name: "riftwalk.mp3",
						size: 5500000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "The Covenant",
				artist: "Droptek",
				duration_seconds: 226,
				sort_order: 11,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/the-covenant.mp3",
						name: "the-covenant.mp3",
						original_name: "the-covenant.mp3",
						size: 6100000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "The Uprising",
				artist: "REAPER x Kumarion",
				duration_seconds: 197,
				sort_order: 12,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/the-uprising.mp3",
						name: "the-uprising.mp3",
						original_name: "the-uprising.mp3",
						size: 4200000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Smog",
				artist: "Droptek & Vorso",
				duration_seconds: 214,
				sort_order: 13,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/smog.mp3",
						name: "smog.mp3",
						original_name: "smog.mp3",
						size: 5700000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Don't Fight It",
				artist: "Melano",
				duration_seconds: 253,
				sort_order: 14,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/dont-fight-it.mp3",
						name: "dont-fight-it.mp3",
						original_name: "dont-fight-it.mp3",
						size: 4900000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Cicero",
				artist: "Rome in Silver",
				duration_seconds: 341,
				sort_order: 15,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/cicero.mp3",
						name: "cicero.mp3",
						original_name: "cicero.mp3",
						size: 4600000,
						mimetype: "audio/mpeg",
					},
				],
				cover: [],
			},
			{
				title: "Heartbreak",
				artist: "Bonobo & Totally Enormous Extinct Dinosaurs",
				duration_seconds: 265,
				sort_order: 16,
				is_featured: false,
				is_public: true,
				audio_file: [
					{
						key: "music/heartbreak.mp3",
						name: "heartbreak.mp3",
						original_name: "heartbreak.mp3",
						size: 6100000,
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
