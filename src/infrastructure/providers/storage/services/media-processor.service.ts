import fs from "node:fs/promises";
import { Injectable, Logger } from "@nestjs/common";
import type { File } from "formidable";
import sharp from "sharp";
import { IMAGE_QUALITY } from "../rustfs.const";

// ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);

export interface ProcessedImageResult {
	buffer: Buffer;
	size: number;
	dimension: number;
}

export interface ProcessedVideoResult {
	path: string;
	filename: string;
}

export interface MediaProcessingConfig {
	timeout?: number;
}

@Injectable()
export class MediaProcessorService {
	private readonly logger = new Logger(MediaProcessorService.name);
	// private readonly tempDir: string;
	// private readonly DEFAULT_TIMEOUT = 300000; // 5 minutes

	// constructor() {
	// 	this.tempDir = path.join(process.cwd(), "src", "assets", TEMP_DIR);
	// }

	/**
	 * Process an image into multiple WebP variants at different dimensions.
	 */
	async processImage(
		file: File,
		dimensions: number[] = [],
	): Promise<ProcessedImageResult[]> {
		const inputBuffer = await fs.readFile(file.filepath);

		const results = await Promise.all(
			dimensions.map(async (dimension) => {
				try {
					const outputBuffer = await sharp(inputBuffer)
						.resize({ width: dimension, withoutEnlargement: true })
						.webp({ quality: IMAGE_QUALITY })
						.toBuffer();

					return {
						buffer: outputBuffer,
						size: outputBuffer.length,
						dimension,
					};
				} catch (error) {
					this.logger.warn(
						`Image optimization failed for dimension ${dimension}, using original`,
						error,
					);
					return { buffer: inputBuffer, size: file.size, dimension };
				}
			}),
		);

		return results;
	}

	/**
	 * Process a video into optimized MP4 format with timeout protection.
	 */
	// async processVideo(
	// 	file: File,
	// 	baseName: string,
	// 	config?: MediaProcessingConfig,
	// ): Promise<ProcessedVideoResult> {
	// 	const outputFilename = `${baseName.split(".")[0]}_optimized.mp4`;
	// 	const outputPath = path.join(this.tempDir, outputFilename);
	// 	const timeoutMs = config?.timeout ?? this.DEFAULT_TIMEOUT;

	// 	await fs.mkdir(path.dirname(outputPath), { recursive: true });

	// 	return new Promise((resolve, reject) => {
	// 		let timeoutTimer: NodeJS.Timeout;

	// 		const command = ffmpeg(file.filepath)
	// 			.videoCodec("libx264")
	// 			.addOption("-preset", VIDEO_PRESET)
	// 			.addOption("-crf", VIDEO_CRF)
	// 			.videoFilters([`scale='min(${VIDEO_MAX_WIDTH},iw)':-2`])
	// 			.audioCodec("aac")
	// 			.audioBitrate(AUDIO_BITRATE)
	// 			.audioChannels(2)
	// 			.addOption("-movflags", "+faststart")
	// 			.on("end", () => {
	// 				clearTimeout(timeoutTimer);
	// 				this.logger.log(`Video optimized: ${outputFilename}`);
	// 				resolve({ path: outputPath, filename: outputFilename });
	// 			})
	// 			.on("error", (err: Error) => {
	// 				clearTimeout(timeoutTimer);
	// 				this.logger.error(
	// 					`FFmpeg error processing ${file.originalFilename}`,
	// 					err,
	// 				);
	// 				reject(err);
	// 			});

	// 		// Set timeout protection
	// 		timeoutTimer = setTimeout(() => {
	// 			command.kill("SIGKILL");
	// 			this.logger.error(
	// 				`Video processing timed out after ${timeoutMs}ms: ${outputFilename}`,
	// 			);
	// 			reject(new InternalServerErrorException("Video processing timed out"));
	// 		}, timeoutMs);

	// 		command.save(outputPath);
	// 	});
	// }
}
