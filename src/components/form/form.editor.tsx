import { TINYMCE_URL } from "@infrastructure/consts/hybrid";
import { sizeIcon } from "@infrastructure/utils/client";
import { useThemeStore } from "@stores/theme.store";
import { Editor } from "@tinymce/tinymce-react";
import { CircleHelp } from "lucide-preact";
import { useContext } from "preact/hooks";
import type {
	FieldValues,
	Path,
	PathValue,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./Form";

interface FormEditorLabelProps<T extends object> {
	title: string;
	name: Path<T>;
	showIndice?: boolean;
	max_height?: number;
	onBlur?: (content: string) => void;
	required?: boolean;
	disabled?: boolean;
}
export function FormEditor<T extends object>({
	name,
	title,
	showIndice = false,
	max_height = 400,
	onBlur,
	required = false,
	disabled,
}: FormEditorLabelProps<T>) {
	const themeStore = useThemeStore();
	const {
		formState: { errors },
		setValue,
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);
	const err = anidarPropiedades(errors, (name as string).split("."));
	const nameId = `${name}-${Math.random().toString(32)}`;

	return (
		<div class="w-full mb-2 space-y-2" key={themeStore.state}>
			<label
				class="block text-sm font-light text-foreground"
				htmlFor={nameId as string}
			>
				{title}
				{required ? <span class="text-primary">*</span> : ""}
				{showIndice ? (
					<div class="relative group inline-block ml-2 align-middle">
						<CircleHelp {...sizeIcon.small} />
						<div class="absolute z-[9] top-0 text-xs bg-black/80 text-white p-2 rounded-[var(--radius-lg)] min-w-[150px] hidden group-hover:block">
							Para agregar Indice:. <br /> ---INDICE---
						</div>
					</div>
				) : null}
			</label>
			<div class="flex items-center gap-2 w-full mt-1">
				<div
					class={`w-full relative ${
						Object.keys(err).length
							? "border-destructive! border" // Use destructive border for error
							: "border border-input" // Use input border normally
					} rounded-[var(--radius-lg)] overflow-hidden bg-background`} // Standard rounded-[var(--radius-lg)] and background
				>
					<Editor
						key={themeStore.state}
						tinymceScriptSrc="/tinymce/tinymce.min.js"
						onEditorChange={(content) => {
							setValue(
								name as unknown as Path<T>,
								content as PathValue<T, Path<T>>,
							);
						}}
						onBlur={(_, editor) => {
							if (onBlur) {
								const content = editor.getContent();
								onBlur(content);
							}
						}}
						disabled={disabled}
						id={nameId}
						value={watch(name as unknown as Path<T>) as string}
						init={{
							language: "es", // Solo esta línea
							language_url: TINYMCE_URL,
							plugins:
								"preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
							editimage_cors_hosts: ["picsum.photos"],
							menubar: "file edit view insert format tools table help",
							toolbar:
								"undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
							autosave_ask_before_unload: true,
							autosave_interval: "30s",
							autosave_prefix: "{path}{query}-{id}-",
							autosave_restore_when_empty: false,
							autosave_retention: "2m",
							image_advtab: true,
							branding: false,
							max_height,
							link_list: [
								{
									title: "My page 1",
									value: "https://www.tiny.cloud",
								},
								{
									title: "My page 2",
									value: "http://www.moxiecode.com",
								},
							],
							image_list: [
								{
									title: "My page 1",
									value: "https://www.tiny.cloud",
								},
								{
									title: "My page 2",
									value: "http://www.moxiecode.com",
								},
							],
							image_class_list: [
								{ title: "None", value: "" },
								{ title: "Some class", value: "class-name" },
							],
							importcss_append: true,
							// file_picker_callback: filePickerCallback,
							height: max_height,
							image_caption: true,
							quickbars_selection_toolbar:
								"bold italic | quicklink h2 h3 blockquote quickimage quicktable",
							noneditable_class: "mceNonEditable",
							toolbar_mode: "sliding",
							contextmenu: "link image table",
							skin: themeStore.state === "dark" ? "oxide-dark" : "oxide",
							content_css: themeStore.state === "dark" ? "dark" : "default",
							content_style: `
                            :root{
                            --card-foreground:${
															themeStore.state === "dark"
																? "#101010"
																: "#F7F8F9"
														};
                            }
                            body { font-family:Helvetica,Arial,sans-serif; font-size:16px; background-color: var(--card-foreground) !important; }`,
						}}
					/>
				</div>
			</div>
			{Object.keys(err).length ? (
				<p class="text-xs text-destructive flex items-center gap-1 mt-1">
					{err?.message}
				</p>
			) : (
				<span class="h-5 w-full block" />
			)}
			<style jsx>{`
        .tox-tinymce-aux {
          z-index: 99999999 !important;
        }
        .tox-tinymce {
          border: 0px !important;
        }
        .tox :not(svg):not(rect) {
          background: var(--color-card-foreground) !important;
        }

        .tox .tox-tbtn:hover {
          background: var(--color-background) !important;
        }
        .tox .tox-edit-area::before {
          border: 0px !important;
        }
        .tox {
          color: var(--color-background) !important;
        }
        .mce-content-body {
          background: var(--color-background) !important;
        }
      `}</style>
		</div>
	);
}

// export default FormEditor;
