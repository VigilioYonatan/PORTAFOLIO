import {
	VideoPlayer,
	type VideoPlayerProps,
} from "@streamspark/react-video-player";

function Video(props: VideoPlayerProps) {
	return (
		<>
			<VideoPlayer theme="dark" {...props} />
			<style jsx>
				{`
                    .rvp-video-player {
                        background: #000;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                        font-family: -apple-system, BlinkMacSystemFont, Segoe UI,
                            Roboto, sans-serif;
                        height: auto;
                        max-width: 100%;
                        outline: none;
                        overflow: hidden;
                        position: relative;
                        width: 100%;
                    }
                    .rvp-video {
                        display: block;
                        height: 100%;
                        outline: none;
                        width: 100%;
                    }
                    .rvp-video-overlay.rvp-show {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    .rvp-video {
                        cursor: pointer;
                        pointer-events: auto !important;
                        z-index: 1;
                    }
                    .rvp-video-overlay *,
                    .rvp-video-overlay .rvp-video-controls,
                    .rvp-video-overlay .rvp-video-title {
                        pointer-events: auto;
                    }
                    .rvp-video-overlay {
                        background: linear-gradient(
                            180deg,
                            rgba(0, 0, 0, 0.7) 0,
                            transparent 20%,
                            transparent 80%,
                            rgba(0, 0, 0, 0.8)
                        );
                        bottom: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        left: 0;
                        opacity: 1 !important;
                        pointer-events: none !important;
                        position: absolute;
                        right: 0;
                        top: 0;
                        transition: opacity 0.01s ease-in-out;
                    }
                    .rvp-video-title {
                        color: #fff;
                        padding: 20px;
                    }
                    .rvp-video-title h3 {
                        font-size: 18px;
                        font-weight: 600;
                        margin: 0;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                    }
                    .rvp-video-controls {
                        color: #fff;
                        padding: 0 20px 20px;
                        position: absolute !important;
                        bottom: 0;
                        right: 0;
                        left: 0;
                    }
                    .rvp-seek-bar-container {
                        cursor: pointer;
                        margin-bottom: 12px;
                        position: relative;
                    }
                    .rvp-seek-bar {
                        align-items: center;
                        display: flex;
                        height: 20px;
                        padding: 8px 0;
                    }
                    .rvp-seek-bar-background {
                        background: hsla(0, 0%, 100%, 0.3);
                        border-radius: 2px;
                        height: 4px;
                        position: relative;
                        transition: height 0.2s ease;
                        width: 100%;
                    }
                    .rvp-seek-bar-container:hover .rvp-seek-bar-background {
                        height: 6px;
                    }
                    .rvp-seek-bar-buffered {
                        background: hsla(0, 0%, 100%, 0.4);
                    }
                    .rvp-seek-bar-buffered,
                    .rvp-seek-bar-progress {
                        border-radius: 2px;
                        height: 100%;
                        left: 0;
                        position: absolute;
                        top: 0;
                        transition: background-color 0.2s ease;
                    }
                    .rvp-seek-bar-progress {
                        background: red;
                    }
                    .rvp-seek-bar-thumb {
                        background: red;
                        border-radius: 50%;
                        height: 12px;
                        opacity: 0;
                        position: absolute;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        transition: opacity 0.2s ease;
                        width: 12px;
                    }
                    .rvp-seek-bar-container:hover .rvp-seek-bar-thumb {
                        opacity: 1;
                    }
                    .rvp-seek-preview {
                        -webkit-backdrop-filter: blur(4px);
                        backdrop-filter: blur(4px);
                        background: rgba(0, 0, 0, 0.8);
                        border-radius: 4px;
                        bottom: 30px;
                        color: #fff;
                        font-size: 12px;
                        padding: 4px 8px;
                        pointer-events: none;
                        position: absolute;
                        z-index: 10;
                    }
                    .rvp-controls-bar {
                        align-items: center;
                        display: flex;
                        gap: 12px;
                        justify-content: space-between;
                        margin-top: 8px;
                    }
                    .rvp-controls-left,
                    .rvp-controls-right {
                        align-items: center;
                        display: flex;
                        gap: 8px;
                    }
                    .rvp-control-btn {
                        align-items: center;
                        background: none;
                        border: none;
                        border-radius: 4px;
                        color: #fff;
                        cursor: pointer;
                        display: flex;
                        justify-content: center;
                        outline: none;
                        padding: 8px;
                        position: relative;
                        transition: all 0.2s ease;
                    }
                    .rvp-control-btn:hover {
                        background: hsla(0, 0%, 100%, 0.2);
                        transform: scale(1.05);
                    }
                    .rvp-control-btn:active {
                        transform: scale(0.95);
                    }
                    .rvp-control-btn.rvp-active {
                        background: rgba(255, 0, 0, 0.8);
                    }
                    .rvp-play-btn svg {
                        margin-left: 2px;
                    }
                    .rvp-time-display {
                        font-size: 14px;
                        font-weight: 500;
                        margin: 0 8px;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                        white-space: nowrap;
                    }
                    .rvp-volume-control {
                        align-items: center;
                        display: flex;
                        position: relative;
                    }
                    .rvp-volume-slider {
                        align-items: center;
                        -webkit-backdrop-filter: blur(8px);
                        backdrop-filter: blur(8px);
                        background: rgba(0, 0, 0, 0.9);
                        border-radius: 8px;
                        bottom: 100%;
                        display: flex;
                        height: 100px;
                        justify-content: center;
                        left: 50%;
                        margin-bottom: 8px;
                        opacity: 0;
                        padding: 12px;
                        position: absolute;
                        transform: translateX(-50%);
                        transition: all 0.2s ease;
                        visibility: hidden;
                        width: 40px;
                        z-index: 10;
                    }
                    .rvp-volume-slider.rvp-show {
                        opacity: 1;
                        visibility: visible;
                    }
                    .rvp-volume-slider-track {
                        align-items: center;
                        display: flex;
                        height: 100%;
                        justify-content: center;
                        position: relative;
                        width: 4px;
                    }
                    .rvp-volume-slider-background {
                        background: hsla(0, 0%, 100%, 0.3);
                        border-radius: 2px;
                        height: 100%;
                        position: relative;
                        width: 4px;
                    }
                    .rvp-volume-slider-fill {
                        background: #fff;
                        border-radius: 2px;
                        bottom: 0;
                        cursor: pointer;
                        height: 50%;
                        position: absolute;
                        width: 100%;
                    }
                    .rvp-volume-slider-thumb {
                        background: #fff;
                        border-radius: 50%;
                        bottom: 50%;
                        height: 12px;
                        left: 50%;
                        position: absolute;
                        transform: translate(-50%, 50%);
                        width: 12px;
                        z-index: 2;
                    }
                    .rvp-playback-speed {
                        position: relative;
                    }
                    .rvp-speed-btn {
                        gap: 4px;
                    }
                    .rvp-speed-label {
                        font-size: 12px;
                        font-weight: 600;
                    }
                    .rvp-speed-menu {
                        -webkit-backdrop-filter: blur(8px);
                        backdrop-filter: blur(8px);
                        background: rgba(0, 0, 0, 0.95);
                        border-radius: 8px;
                        bottom: 100%;
                        margin-bottom: 8px;
                        min-width: 140px;
                        opacity: 0;
                        padding: 8px;
                        position: absolute;
                        right: 0;
                        transition: all 0.2s ease;
                        visibility: hidden;
                        z-index: 10;
                    }
                    .rvp-speed-menu.rvp-show {
                        opacity: 1;
                        visibility: visible;
                    }
                    .rvp-speed-menu-title {
                        color: hsla(0, 0%, 100%, 0.7);
                        font-size: 12px;
                        font-weight: 600;
                        margin-bottom: 8px;
                        padding: 0 8px;
                    }
                    .rvp-speed-option {
                        background: none;
                        border: none;
                        border-radius: 4px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 14px;
                        outline: none;
                        padding: 8px;
                        text-align: left;
                        transition: background-color 0.2s ease;
                        width: 100%;
                    }
                    .rvp-speed-option:hover {
                        background: hsla(0, 0%, 100%, 0.1);
                    }
                    .rvp-speed-option.rvp-active {
                        background: rgba(255, 0, 0, 0.8);
                        font-weight: 600;
                    }
                    .rvp-video-loading {
                        left: 50%;
                        position: absolute;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 5;
                    }
                    .rvp-loading-spinner {
                        animation: rvp-spin 1s linear infinite;
                        border: 3px solid hsla(0, 0%, 100%, 0.3);
                        border-radius: 50%;
                        border-top-color: #fff;
                        height: 40px;
                        width: 40px;
                    }
                    .rvp-feedback-overlay {
                        align-items: center;
                        animation: rvp-feedback-fade 0.8s ease-out forwards;
                        -webkit-backdrop-filter: blur(10px);
                        backdrop-filter: blur(10px);
                        background: rgba(0, 0, 0, 0.85);
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                        color: #fff;
                        display: flex;
                        justify-content: center;
                        left: 50%;
                        padding: 20px;
                        pointer-events: none;
                        position: absolute;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 20;
                    }
                    .rvp-play-pause-feedback {
                        border-radius: 16px;
                        padding: 24px;
                    }
                    .rvp-feedback-icon {
                        opacity: 0.9;
                    }
                    .rvp-feedback-icon,
                    .rvp-feedback-text {
                        align-items: center;
                        display: flex;
                        justify-content: center;
                    }
                    .rvp-feedback-text {
                        font-size: 20px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                    }
                    .rvp-seek-feedback {
                        background: rgba(0, 0, 0, 0.9);
                        padding: 16px 24px;
                    }
                    .rvp-seek-feedback .rvp-feedback-text {
                        color: #ff6b6b;
                        font-size: 24px;
                        font-weight: 700;
                    }
                    .rvp-volume-feedback {
                        background: rgba(0, 0, 0, 0.9);
                        padding: 16px 20px;
                    }
                    .rvp-volume-feedback .rvp-feedback-text {
                        color: #4ecdc4;
                        font-size: 18px;
                        font-weight: 600;
                    }
                    @keyframes rvp-feedback-fade {
                        0% {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.7);
                        }
                        15% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1.05);
                        }
                        25% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        85% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        to {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.8);
                        }
                    }
                    .rvp-video-player.rvp-light .rvp-video-overlay {
                        background: linear-gradient(
                            180deg,
                            hsla(0, 0%, 100%, 0.9) 0,
                            transparent 20%,
                            transparent 80%,
                            hsla(0, 0%, 100%, 0.95)
                        );
                    }
                    .rvp-video-player.rvp-light .rvp-control-btn,
                    .rvp-video-player.rvp-light .rvp-controls-bar,
                    .rvp-video-player.rvp-light .rvp-video-title {
                        color: #333;
                    }
                    .rvp-video-player.rvp-light .rvp-control-btn:hover {
                        background: rgba(0, 0, 0, 0.1);
                    }
                    .rvp-video-player.rvp-light .rvp-seek-bar-background {
                        background: rgba(0, 0, 0, 0.2);
                    }
                    .rvp-video-player.rvp-light .rvp-seek-bar-buffered {
                        background: rgba(0, 0, 0, 0.3);
                    }
                    .rvp-video-player.rvp-light .rvp-seek-bar-progress,
                    .rvp-video-player.rvp-light .rvp-seek-bar-thumb {
                        background: #06c;
                    }
                    .rvp-video-player.rvp-light .rvp-speed-menu,
                    .rvp-video-player.rvp-light .rvp-volume-slider {
                        background: hsla(0, 0%, 100%, 0.95);
                        color: #333;
                    }
                    .rvp-video-player.rvp-light .rvp-volume-slider-fill,
                    .rvp-video-player.rvp-light .rvp-volume-slider-thumb {
                        background: #333;
                    }
                    .rvp-video-player.rvp-light .rvp-speed-option {
                        color: #333;
                    }
                    .rvp-video-player.rvp-light .rvp-speed-option:hover {
                        background: rgba(0, 0, 0, 0.1);
                    }
                    .rvp-video-player.rvp-light .rvp-speed-option.rvp-active {
                        background: rgba(0, 102, 204, 0.8);
                        color: #fff;
                    }
                    .rvp-video-player.rvp-light .rvp-loading-spinner {
                        border-color: #333 rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.3);
                    }
                    .rvp-video-player.rvp-light .rvp-feedback-overlay {
                        background: hsla(0, 0%, 100%, 0.95);
                        color: #333;
                    }
                    .rvp-video-player.rvp-light
                        .rvp-seek-feedback
                        .rvp-feedback-text {
                        color: #e74c3c;
                    }
                    .rvp-video-player.rvp-light
                        .rvp-volume-feedback
                        .rvp-feedback-text {
                        color: #2980b9;
                    }
                    @media (max-width: 768px) {
                        .rvp-video-player {
                            border-radius: 0;
                        }
                        .rvp-video-overlay {
                            background: linear-gradient(
                                180deg,
                                rgba(0, 0, 0, 0.8) 0,
                                transparent 15%,
                                transparent 85%,
                                rgba(0, 0, 0, 0.9)
                            );
                        }
                        .rvp-video-title {
                            padding: 15px;
                        }
                        .rvp-video-title h3 {
                            font-size: 16px;
                        }
                        .rvp-video-controls {
                            padding: 0 15px 15px;
                        }
                        .rvp-controls-bar {
                            gap: 8px;
                        }
                        .rvp-controls-left,
                        .rvp-controls-right {
                            gap: 6px;
                        }
                        .rvp-control-btn {
                            padding: 6px;
                        }
                        .rvp-time-display {
                            font-size: 12px;
                            margin: 0 4px;
                        }
                        .rvp-speed-label {
                            display: none;
                        }
                        .rvp-volume-slider {
                            height: 80px;
                            padding: 10px;
                            width: 35px;
                        }
                        .rvp-speed-menu {
                            min-width: 120px;
                        }
                        .rvp-feedback-overlay {
                            padding: 16px;
                        }
                        .rvp-feedback-text {
                            font-size: 16px;
                        }
                        .rvp-seek-feedback .rvp-feedback-text {
                            font-size: 20px;
                        }
                        .rvp-play-pause-feedback {
                            padding: 20px;
                        }
                        .rvp-feedback-icon svg {
                            height: 60px;
                            width: 60px;
                        }
                    }
                    @media (max-width: 480px) {
                        .rvp-video-title h3 {
                            font-size: 14px;
                        }
                        .rvp-time-display {
                            font-size: 11px;
                        }
                        .rvp-control-btn {
                            padding: 4px;
                        }
                        .rvp-control-btn svg {
                            height: 18px;
                            width: 18px;
                        }
                        .rvp-play-btn svg {
                            height: 20px;
                            width: 20px;
                        }
                        .rvp-feedback-overlay {
                            padding: 12px;
                        }
                        .rvp-feedback-text {
                            font-size: 14px;
                        }
                        .rvp-seek-feedback .rvp-feedback-text {
                            font-size: 18px;
                        }
                        .rvp-play-pause-feedback {
                            padding: 16px;
                        }
                        .rvp-feedback-icon svg {
                            height: 50px;
                            width: 50px;
                        }
                    }
                    .rvp-control-btn:focus,
                    .rvp-seek-bar-container:focus,
                    .rvp-speed-option:focus,
                    .rvp-video-player:focus,
                    .rvp-volume-slider-track:focus {
                        outline-offset: 2px;
                    }
                    @media (prefers-contrast: high) {
                        .rvp-video-overlay {
                            background: linear-gradient(
                                180deg,
                                rgba(0, 0, 0, 0.9) 0,
                                transparent 20%,
                                transparent 80%,
                                rgba(0, 0, 0, 0.95)
                            );
                        }
                        .rvp-control-btn:hover {
                            background: hsla(0, 0%, 100%, 0.4);
                        }
                        .rvp-feedback-overlay {
                            background: rgba(0, 0, 0, 0.95);
                            border: 2px solid #fff;
                        }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .rvp-control-btn,
                        .rvp-seek-bar-background,
                        .rvp-seek-bar-thumb,
                        .rvp-speed-menu,
                        .rvp-video-overlay,
                        .rvp-volume-slider {
                            transition: none;
                        }
                        .rvp-loading-spinner {
                            animation: none;
                        }
                        .rvp-feedback-overlay {
                            animation: none;
                            opacity: 1;
                        }
                    }
                    .rvp-video-player:fullscreen {
                        border-radius: 0;
                    }
                    .rvp-video-player:fullscreen .rvp-video-controls {
                        padding: 0 40px 40px;
                        position: absolute !important;
                        bottom: 0;
                        right: 0;
                        left: 0;
                    }
                    .rvp-video-player:fullscreen .rvp-video-title {
                        padding: 40px;
                    }
                    .rvp-thumbnail {
                        background: rgba(0, 0, 0, 0.8);
                        border-radius: 4px;
                        bottom: 100%;
                        color: #fff;
                        font-size: 12px;
                        padding: 4px;
                        position: absolute;
                        transform: translateX(-50%);
                        z-index: 20;
                    }
                    .rvp-thumbnail img {
                        display: block;
                        height: auto;
                        margin-bottom: 4px;
                        width: 120px;
                    }
                    .rvp-thumbnail-preview {
                        align-items: center;
                        bottom: 100%;
                        display: flex;
                        flex-direction: column;
                        pointer-events: none;
                        position: absolute;
                        transform: translateX(-50%);
                        z-index: 10;
                    }
                    .rvp-thumbnail-preview img {
                        border-radius: 4px;
                        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                        height: 90px;
                        -o-object-fit: cover;
                        object-fit: cover;
                        width: 160px;
                    }
                    .rvp-thumbnail-preview span {
                        background: rgba(0, 0, 0, 0.7);
                        border-radius: 4px;
                        color: #fff;
                        font-size: 12px;
                        margin-top: 4px;
                        padding: 2px 6px;
                    }
                    .rvp-seek-bar {
                        background-color: hsla(0, 0%, 100%, 0.2);
                        border-radius: 4px;
                        cursor: pointer;
                        height: 8px;
                        margin-bottom: 6px;
                        overflow: hidden;
                        position: relative;
                        transition: background-color 0.2s ease;
                    }
                    .rvp-progress-bg {
                        background-color: hsla(0, 0%, 100%, 0.1);
                        width: 100%;
                    }
                    .rvp-progress-bg,
                    .rvp-progress-buffered {
                        height: 100%;
                        left: 0;
                        position: absolute;
                        top: 0;
                    }
                    .rvp-progress-buffered {
                        background-color: hsla(0, 0%, 78%, 0.4);
                        z-index: 1;
                    }
                    .rvp-progress-played {
                        background-color: #3b82f6;
                        height: 100%;
                        left: 0;
                        position: absolute;
                        top: 0;
                        z-index: 2;
                    }
                    @keyframes rvp-spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(1turn);
                        }
                    }
                    .rvp-video-player.rvp-hide-controls .rvp-video-overlay {
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                    .rvp-video-player.rvp-hide-controls
                        .rvp-speed-menu.rvp-show,
                    .rvp-video-player.rvp-hide-controls
                        .rvp-volume-slider.rvp-show {
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        visibility: visible !important;
                    }
                    .rvp-video-overlay {
                        transition: opacity 0.4s ease-in-out !important;
                    }
                    .rvp-hide-controls .rvp-video-overlay {
                        opacity: 0;
                        pointer-events: none;
                    }
                    .rvp-seekbar-container {
                        background: hsla(0, 0%, 100%, 0.3);
                        border-radius: 4px;
                        cursor: pointer;
                        height: 8px;
                        position: relative;
                    }
                    .rvp-seekbar-track {
                        background: hsla(0, 0%, 100%, 0.2);
                        left: 0;
                        right: 0;
                        z-index: 1;
                    }
                    .rvp-seekbar-buffered,
                    .rvp-seekbar-track {
                        border-radius: 4px;
                        height: 6px;
                        position: absolute;
                        top: 0;
                    }
                    .rvp-seekbar-buffered {
                        background: hsla(0, 0%, 100%, 0.4);
                        z-index: 2;
                    }
                    .rvp-seekbar-played {
                        background: #f03;
                        border-radius: 4px;
                        height: 6px;
                        position: absolute;
                        top: 0;
                        z-index: 3;
                    }
                    .rvp-seekbar-thumb {
                        background: #f03;
                        border-radius: 50%;
                        height: 14px;
                        position: absolute;
                        top: -4px;
                        transform: translateX(-50%);
                        width: 14px;
                        z-index: 4;
                    }
                `}
			</style>
		</>
	);
}

export default Video;
