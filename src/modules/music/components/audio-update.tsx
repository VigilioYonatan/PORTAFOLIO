import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { musicTrackUpdateApi } from "@modules/music/apis/music.update.api";
import {
	type MusicUpdateDto,
	musicUpdateDto,
} from "@modules/music/dtos/music.update.dto";
import type { MusicTrackSchema } from "@modules/music/schemas/music.schema";
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
import { useForm, type Resolver } from "react-hook-form";
import type { MusicTrackIndexResponseDto } from "../dtos/music.response.dto";

interface AudioUpdateProps {
	music: MusicTrackSchema;
	refetch: (data: Refetch<MusicTrackIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export default function AudioUpdate({
	music,
	refetch,
	onClose,
}: AudioUpdateProps) {
	const musicUpdateMutation = musicTrackUpdateApi(music.id);

	const musicUpdateForm = useForm<MusicUpdateDto>({
		resolver: zodResolver(musicUpdateDto ) as Resolver<MusicUpdateDto>,
		mode: "all",
		defaultValues: { ...music },
	});

	function onMusicUpdate(body: MusicUpdateDto) {
		musicUpdateMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "Audio Module Revised",
					text: `"${body.title}" sonic signature updated.`,
				});
				refetch(data.music);
				onClose();
			},
			onError(error) {
				handlerError(musicUpdateForm, error, "Transmission Revision Failure");
			},
		});
	}

	return (
		<div class="px-1 space-y-4">
			<div class="flex flex-col gap-1 border-b border-white/5 pb-4 mb-4">
				<span class="text-[9px] font-black tracking-[0.5em] text-primary uppercase animate-pulse">
					RE_TUNING_SIGNAL
				</span>
				<h2 class="text-xl font-black tracking-tight text-foreground uppercase">
					Update Audio Component
				</h2>
			</div>

			<Form {...musicUpdateForm} onSubmit={onMusicUpdate}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<MusicUpdateDto>
						name="title"
						title="WAVE_TITLE"
						ico={<Music size={18} />}
						placeholder="Ethereal Connection"
					/>
					<Form.control<MusicUpdateDto>
						name="artist"
						title="SONIC_ARCHITECT (ARTIST)"
						ico={<Info size={18} />}
						placeholder="Virtual Self"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control<MusicUpdateDto>
						name="duration_seconds"
						title="TIME_INDEX (SECONDS)"
						type="number"
						ico={<Calendar size={18} />}
						placeholder="180"
						options={{ setValueAs: formSelectNumber }}
					/>
					<Form.control<MusicUpdateDto>
						name="sort_order"
						title="SEQUENCE_POSITION"
						type="number"
						ico={<Info size={18} />}
						placeholder="0"
						options={{ setValueAs: formSelectNumber }}
					/>
				</div>

				<div class="flex items-center gap-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
					<Form.control.toggle<MusicUpdateDto>
						name="is_public"
						title="PUBLIC_BROADCAST"
					/>
					<Form.control.toggle<MusicUpdateDto>
						name="is_featured"
						title="FEATURED_WAVE"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.file<MusicUpdateDto>
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
					<Form.control.file<MusicUpdateDto>
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
					title="COMMIT_FREQ_REVISION"
					loading_title="SYNCING..."
					isLoading={musicUpdateMutation.isLoading || false}
					disabled={musicUpdateMutation.isLoading || false}
					className="w-full mt-6 bg-primary text-primary-foreground font-black py-4 uppercase tracking-widest rounded-xl hover:brightness-110 transition-all border-none"
				/>
			</Form>
		</div>
	);
}
