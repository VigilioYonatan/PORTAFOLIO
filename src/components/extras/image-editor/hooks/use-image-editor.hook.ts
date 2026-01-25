import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export interface ImageEditorProps {
	file: File;
	onSave: (editedFile: File) => void;
	onClose: () => void;
}

export interface ImageFilters {
	brightness: number;
	contrast: number;
	saturation: number;
	hue: number;
	blur: number;
	sepia: number;
	grayscale: number;
}

interface CropData {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function useImageEditor({ file, onSave }: ImageEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const originalImage = useSignal<HTMLImageElement | null>(null);
	const filters = useSignal<ImageFilters>({
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
		blur: 0,
		sepia: 0,
		grayscale: 0,
	});
	const rotation = useSignal(0);
	const flipHorizontal = useSignal(false);
	const cropMode = useSignal(false);
	const cropData = useSignal<CropData | null>(null);
	const isDragging = useSignal(false);
	const startPos = useSignal({ x: 0, y: 0 });
	const history = useSignal<ImageFilters[]>([]);
	const historyIndex = useSignal(-1);
	const activeTab = useSignal("filters");
	const dimensions = useSignal({ width: 0, height: 0 });
	const maintainAspectRatio = useSignal(true);
	const aspectRatio = useSignal(1);

	useEffect(() => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			originalImage.value = img;
			dimensions.value = { width: img.width, height: img.height };
			aspectRatio.value = img.width / img.height;
			drawImage(img);
		};
		img.src = URL.createObjectURL(file);
	}, [file]);

	useEffect(() => {
		if (originalImage.value) {
			drawImage(originalImage.value);
		}
	}, [
		filters.value,
		rotation.value,
		flipHorizontal.value,
		cropData.value,
		dimensions.value,
	]);

	const drawImage = (img: HTMLImageElement) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas dimensions
		if (cropData.value) {
			canvas.width = cropData.value.width;
			canvas.height = cropData.value.height;
		} else {
			canvas.width = dimensions.value.width;
			canvas.height = dimensions.value.height;
		}

		ctx.save();

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Apply transformations
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate((rotation.value * Math.PI) / 180);
		if (flipHorizontal.value) ctx.scale(-1, 1);
		ctx.translate(-canvas.width / 2, -canvas.height / 2);

		// Apply filters
		const filterString = `
            brightness(${filters.value.brightness}%)
            contrast(${filters.value.contrast}%)
            saturate(${filters.value.saturation}%)
            hue-rotate(${filters.value.hue}deg)
            blur(${filters.value.blur}px)
            sepia(${filters.value.sepia}%)
            grayscale(${filters.value.grayscale}%)
        `;
		ctx.filter = filterString;

		// Draw image with crop or resize
		if (cropData.value) {
			ctx.drawImage(
				img,
				cropData.value.x,
				cropData.value.y,
				cropData.value.width,
				cropData.value.height,
				0,
				0,
				cropData.value.width,
				cropData.value.height,
			);
		} else {
			ctx.drawImage(
				img,
				0,
				0,
				img.width,
				img.height,
				0,
				0,
				dimensions.value.width,
				dimensions.value.height,
			);
		}

		ctx.restore();

		// Draw crop rectangle if in crop mode
		if (cropMode.value && !cropData.value) {
			ctx.strokeStyle = "#3b82f6";
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.strokeRect(0, 0, canvas.width, canvas.height);
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (!cropMode.value || !canvasRef.current) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		startPos.value = { x, y };
		isDragging.value = true;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!cropMode.value || !isDragging.value || !canvasRef.current) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const width = x - startPos.value.x;
		const height = y - startPos.value.y;

		// Update crop preview
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		drawImage(originalImage.value!);

		ctx.strokeStyle = "#3b82f6";
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.strokeRect(startPos.value.x, startPos.value.y, width, height);
	};

	const handleMouseUp = (e: MouseEvent) => {
		if (!cropMode.value || !isDragging.value || !canvasRef.current) return;

		isDragging.value = false;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const width = x - startPos.value.x;
		const height = y - startPos.value.y;

		// Ensure positive dimensions
		const absWidth = Math.abs(width);
		const absHeight = Math.abs(height);
		const absX = width < 0 ? startPos.value.x + width : startPos.value.x;
		const absY = height < 0 ? startPos.value.y + height : startPos.value.y;

		// Set crop data
		cropData.value = {
			x: absX,
			y: absY,
			width: absWidth,
			height: absHeight,
		};

		// Update dimensions after crop
		dimensions.value = { width: absWidth, height: absHeight };
		cropMode.value = false;
	};

	const cancelCrop = () => {
		cropData.value = null;
		cropMode.value = false;
		if (originalImage.value) {
			dimensions.value = {
				width: originalImage.value.width,
				height: originalImage.value.height,
			};
		}
	};

	const updateFilter = (key: keyof ImageFilters, value: number) => {
		const newFilters = { ...filters.value, [key]: value };
		filters.value = newFilters;

		// Add to history
		const newHistory = history.value.slice(0, historyIndex.value + 1);
		newHistory.push(newFilters);
		history.value = newHistory;
		historyIndex.value = newHistory.length - 1;
	};

	const undo = () => {
		if (historyIndex.value > 0) {
			historyIndex.value--;
			filters.value = history.value[historyIndex.value];
		}
	};

	const redo = () => {
		if (historyIndex.value < history.value.length - 1) {
			historyIndex.value++;
			filters.value = history.value[historyIndex.value];
		}
	};

	const resetFilters = () => {
		filters.value = {
			brightness: 100,
			contrast: 100,
			saturation: 100,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
		};
		rotation.value = 0;
		flipHorizontal.value = false;
		cropData.value = null;
		if (originalImage.value) {
			dimensions.value = {
				width: originalImage.value.width,
				height: originalImage.value.height,
			};
		}
	};

	const removeBackground = async () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		// Simple background removal based on edge detection
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];

			// Simple white background removal
			if (r > 240 && g > 240 && b > 240) {
				data[i + 3] = 0; // Make transparent
			}
		}

		ctx.putImageData(imageData, 0, 0);
	};

	const saveImage = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.toBlob((blob) => {
			if (blob) {
				const editedFile = new File([blob], file.name, {
					type: file.type,
				});
				onSave(editedFile);
			}
		}, file.type);
	};

	const handleResize = (width: number, height: number) => {
		dimensions.value = { width, height };
	};

	const toggleMaintainAspectRatio = () => {
		maintainAspectRatio.value = !maintainAspectRatio.value;
	};

	return {
		canvasRef,
		filters,
		rotation,
		flipHorizontal,
		cropMode,
		cropData,
		history,
		historyIndex,
		activeTab,
		dimensions,
		maintainAspectRatio,
		aspectRatio,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		cancelCrop,
		updateFilter,
		undo,
		redo,
		resetFilters,
		removeBackground,
		saveImage,
		handleResize,
		toggleMaintainAspectRatio,
	};
}
