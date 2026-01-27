import { sizeIcon } from "@infrastructure/utils/client";
import {
	ArrowLeftCircle,
	ArrowRightCircle,
	Crop,
	Download,
	Palette,
	Repeat,
	RotateCw,
	XIcon,
} from "lucide-preact";
import type { JSX } from "preact/jsx-runtime";
import Button from "../../button";
import { Card } from "../../card";
import {
	type ImageEditorProps,
	useImageEditor,
} from "../hooks/use-image-editor.hook";
import ImageSlider from "./image-slider";
import ImageTabs from "./image-tabs";

function ImageEditor(
	props: ImageEditorProps & { title?: JSX.Element | string },
) {
	const {
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
	} = useImageEditor(props);

	const { onClose } = props;

	return (
		<Card class="w-full max-w-6xl max-h-[90vh] overflow-hidden">
			<Card.content class="p-0">
				{props.title && (
					<div class="flex items-center gap-2 text-xl font-bold p-4 border-b border-border">
						{props.title}
					</div>
				)}
				<div class="flex flex-col lg:flex-row h-[60vh]">
					{/* Canvas Area */}
					<div class="flex-1 flex items-center justify-center bg-muted p-4">
						<canvas
							ref={canvasRef}
							class="max-w-full max-h-full border border-border shadow-lg"
							style={{ maxWidth: "100%", maxHeight: "100%" }}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseUp}
						/>
					</div>

					{/* Controls */}
					<div class="w-80 bg-card overflow-y-auto flex flex-col gap-2">
						{" "}
						<div class="flex items-center gap-2 justify-end">
							<Button
								size="sm"
								onClick={undo}
								disabled={historyIndex.value <= 0}
								variant="primary"
								type="button"
							>
								<ArrowLeftCircle {...sizeIcon.small} />
							</Button>
							<Button
								size="sm"
								onClick={redo}
								disabled={historyIndex.value >= history.value.length - 1}
								variant="primary"
								type="button"
							>
								<ArrowRightCircle {...sizeIcon.small} />
							</Button>
						</div>
						<ImageTabs
							onTabChange={(tabId) => {
								activeTab.value = tabId;
							}}
							tabs={[
								{
									id: "filters",
									label: "Filtros",
									content: (
										<div class="p-4 space-y-4">
											<div>
												<label htmlFor="brightness">
													Brillo: {filters.value.brightness}%
												</label>
												<ImageSlider
													value={[filters.value.brightness]}
													onValueChange={([value]) =>
														updateFilter("brightness", value)
													}
													min={0}
													max={200}
													step={1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="contrast">
													Contraste: {filters.value.contrast}%
												</label>
												<ImageSlider
													value={[filters.value.contrast]}
													onValueChange={([value]) =>
														updateFilter("contrast", value)
													}
													min={0}
													max={200}
													step={1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="saturation">
													Saturación: {filters.value.saturation}%
												</label>
												<ImageSlider
													value={[filters.value.saturation]}
													onValueChange={([value]) =>
														updateFilter("saturation", value)
													}
													min={0}
													max={200}
													step={1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="hue">Matiz: {filters.value.hue}°</label>
												<ImageSlider
													value={[filters.value.hue]}
													onValueChange={([value]) =>
														updateFilter("hue", value)
													}
													min={-180}
													max={180}
													step={1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="blur">
													Desenfoque: {filters.value.blur}px
												</label>
												<ImageSlider
													value={[filters.value.blur]}
													onValueChange={([value]) =>
														updateFilter("blur", value)
													}
													min={0}
													max={10}
													step={0.1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="sepia">
													Sepia: {filters.value.sepia}%
												</label>
												<ImageSlider
													value={[filters.value.sepia]}
													onValueChange={([value]) =>
														updateFilter("sepia", value)
													}
													min={0}
													max={100}
													step={1}
													className="mt-2"
												/>
											</div>
											<div>
												<label htmlFor="grayscale">
													Escala de grises: {filters.value.grayscale}%
												</label>
												<ImageSlider
													value={[filters.value.grayscale]}
													onValueChange={([value]) =>
														updateFilter("grayscale", value)
													}
													min={0}
													max={100}
													step={1}
													className="mt-2"
												/>
											</div>
										</div>
									),
								},
								{
									id: "transform",
									label: "Transformar",
									content: (
										<div class="p-4 space-y-4">
											<Button
												variant="outline"
												className="w-full bg-transparent"
												onClick={() => {
													rotation.value += 90;
												}}
												type="button"
											>
												<RotateCw {...sizeIcon.small} className="mr-2" />
												Rotar 90°
											</Button>
											<Button
												variant="outline"
												className="w-full bg-transparent"
												onClick={() => {
													flipHorizontal.value = !flipHorizontal.value;
												}}
												type="button"
											>
												<Repeat {...sizeIcon.small} className="mr-2" />
												Voltear Horizontal
											</Button>
											<Button
												variant="outline"
												className="w-full bg-transparent"
												onClick={() => {
													cropMode.value = !cropMode.value;
													if (!cropMode.value) {
														cancelCrop();
													}
												}}
												type="button"
											>
												<Crop {...sizeIcon.small} className="mr-2" />
												{cropMode.value ? "Cancelar Recorte" : "Recortar"}
											</Button>
											{cropData.value && (
												<Button
													variant="outline"
													className="w-full bg-transparent text-destructive"
													onClick={cancelCrop}
													type="button"
												>
													<XIcon {...sizeIcon.small} className="mr-2" />
													Eliminar Recorte
												</Button>
											)}
										</div>
									),
								},
								{
									id: "advanced",
									label: "Avanzado",
									content: (
										<div class="p-4 space-y-4">
											<div>
												<label htmlFor="maintainAspectRatio" class="block mb-2">
													Redimensionar
												</label>
												<div class="flex items-center mb-2">
													<input
														type="checkbox"
														checked={maintainAspectRatio.value}
														onChange={toggleMaintainAspectRatio}
														class="mr-2"
													/>
													<span>Mantener relación de aspecto</span>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div>
														<label htmlFor="width" class="block mb-2">
															Ancho (px)
														</label>
														<input
															type="number"
															value={dimensions.value.width}
															onChange={(e) => {
																const newWidth = Number.parseInt(
																	e.currentTarget.value,
																	10,
																);
																if (!Number.isNaN(newWidth)) {
																	const newHeight = maintainAspectRatio.value
																		? Math.round(newWidth / aspectRatio.value)
																		: dimensions.value.height;
																	handleResize(newWidth, newHeight);
																}
															}}
															class="w-full p-2 border border-input rounded-lg bg-background text-foreground"
														/>
													</div>
													<div>
														<label htmlFor="height" class="block mb-2">
															Alto (px)
														</label>
														<input
															type="number"
															value={dimensions.value.height}
															onChange={(e) => {
																const newHeight = Number.parseInt(
																	e.currentTarget.value,
																	10,
																);
																if (!Number.isNaN(newHeight)) {
																	const newWidth = maintainAspectRatio.value
																		? Math.round(newHeight * aspectRatio.value)
																		: dimensions.value.width;
																	handleResize(newWidth, newHeight);
																}
															}}
															class="w-full p-2 border border-input rounded-lg bg-background text-foreground"
														/>
													</div>
												</div>
											</div>
											<Button
												variant="outline"
												className="w-full bg-transparent"
												onClick={removeBackground}
												type="button"
											>
												<Palette {...sizeIcon.small} className="mr-2" />
												Eliminar Fondo
											</Button>
											<Button
												variant="outline"
												className="w-full bg-transparent"
												onClick={resetFilters}
												type="button"
											>
												Restablecer Todo
											</Button>
										</div>
									),
								},
							]}
							activeTab={activeTab.value}
							className="w-full"
						/>
					</div>
				</div>

				{/* Action Buttons */}
				<div class="flex justify-end gap-2 p-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancelar
					</Button>
					<Button type="button" onClick={saveImage}>
						<Download {...sizeIcon.small} className="mr-2" />
						Guardar Cambios
					</Button>
				</div>
			</Card.content>
		</Card>
	);
}

export default ImageEditor;
