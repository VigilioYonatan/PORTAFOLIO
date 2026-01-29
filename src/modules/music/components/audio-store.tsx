import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { musicTrackStoreApi } from "@modules/music/apis/music.store.api";
import {
	type MusicStoreDto,
	musicStoreDto,
} from "@modules/music/dtos/music.store.dto";
import {
	typeTextExtensions,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { sweetModal } from "@vigilio/sweet";
import {
	Calendar,
	Headphones,
	Image as ImageIcon,
	Info,
	Music,
} from "lucide-preact";
import { type Resolver, useForm } from "react-hook-form";
import type { MusicTrackIndexResponseDto } from "../dtos/music.response.dto";

interface AudioStoreProps {
	refetch: (data: Refetch<MusicTrackIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function AudioStore({ refetch, onClose }: AudioStoreProps) {
	const musicStoreMutation = musicTrackStoreApi();

	const musicStoreForm = useForm<MusicStoreDto>({
		resolver: zodResolver(musicStoreDto) as Resolver<MusicStoreDto>,
		mode: "all",
	});

	function onMusicStore(body: MusicStoreDto) {
		musicStoreMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Audio Module Synchronized",
					text: `"${body.title}" successfully injected into frequency core.`,
				});
				refetch(data.music);
				onClose();
			},
			onError(error) {
				handlerError(musicStoreForm, error, "Transmission Interruption");
			},
		});
	}

	return (
		<div class="px-1 space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					TRANSMITTING_NEW_WAVE
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Insert Audio Component
				</h2>
			</div>

			<Form {...musicStoreForm} onSubmit={onMusicStore}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<MusicStoreDto>
						name="title"
						title="WAVE_TITLE"
						ico={<Music size={18} />}
						placeholder="Ethereal Connection"
					/>
					<Form.control<MusicStoreDto>
						name="artist"
						title="SONIC_ARCHITECT (ARTIST)"
						ico={<Info size={18} />}
						placeholder="Virtual Self"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<MusicStoreDto>
						name="duration_seconds"
						title="TIME_INDEX (SECONDS)"
						type="number"
						ico={<Calendar size={18} />}
						placeholder="180"
						options={{ setValueAs: formSelectNumber }}
					/>
					<Form.control<MusicStoreDto>
						name="sort_order"
						title="SEQUENCE_POSITION"
						type="number"
						ico={<Info size={18} />}
						placeholder="0"
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<div class="flex items-center gap-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
					<Form.control.toggle<MusicStoreDto>
						name="is_public"
						title="PUBLIC_BROADCAST"
					/>
					<Form.control.toggle<MusicStoreDto>
						name="is_featured"
						title="FEATURED_WAVE"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.file<MusicStoreDto>
						name="audio_file"
						title="AUDIO_STREAM"
						ico={<Headphones size={18} />}
						entity="music_track"
						property="audio_file"
						typeFile="file"
						typesText={typeTextExtensions(
							UPLOAD_CONFIG.music_track.audio_file!.mime_types,
						)}
						accept={UPLOAD_CONFIG.music_track.audio_file!.mime_types.join(", ")}
					/>
					<Form.control.file<MusicStoreDto>
						name="cover"
						title="VISUAL_ID"
						ico={<ImageIcon size={18} />}
						entity="music_track"
						property="cover"
						typeFile="image"
						typesText={typeTextExtensions(
							UPLOAD_CONFIG.music_track.cover!.mime_types,
						)}
						accept={UPLOAD_CONFIG.music_track.cover!.mime_types.join(", ")}
					/>
				</div>

				<Form.button.submit
					title="INITIALIZE_TRANSMISSION"
					loading_title="TRANSMITTING..."
					isLoading={musicStoreMutation.isLoading || false}
					disabled={musicStoreMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
