// =============================================================================
// RUSTFS STORAGE CONFIGURATION CONSTANTS
// =============================================================================

/** WebP compression quality (0-100) */
export const IMAGE_QUALITY = 80;

/** Video encoding Constant Rate Factor (18-28 recommended, lower = better quality) */
export const VIDEO_CRF = "26";

/** Video encoding preset (ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow) */
export const VIDEO_PRESET = "slow";

/** Audio bitrate for video transcoding */
export const AUDIO_BITRATE = "128k";

/** Max video width (maintains aspect ratio) */
export const VIDEO_MAX_WIDTH = 1280;

/** Presigned URL expiration in seconds */
export const PRESIGNED_URL_EXPIRY = 900; // 15 minutes

/** Multipart upload part URL expiration in seconds */
export const MULTIPART_PART_EXPIRY = 3600; // 1 hour

/** Maximum retry attempts for S3 operations */
export const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
export const RETRY_BASE_DELAY_MS = 500;

/** Temporary files directory name */
export const TEMP_DIR = "temp";

/** Signed URL cache TTL in seconds (50 min, leaving 10 min safety margin vs 1h expiry) */
export const SIGNED_URL_CACHE_TTL = 3000;
