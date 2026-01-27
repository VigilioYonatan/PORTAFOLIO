import { cn } from "@infrastructure/utils/client";
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CodeToggle,
	CreateLink,
	codeBlockPlugin,
	codeMirrorPlugin,
	DiffSourceToggleWrapper,
	diffSourcePlugin,
	frontmatterPlugin,
	headingsPlugin,
	InsertImage,
	InsertTable,
	InsertThematicBreak,
	imagePlugin,
	ListsToggle,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	MDXEditor,
	type MDXEditorMethods,
	markdownShortcutPlugin,
	quotePlugin,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
} from "@mdxeditor/editor";
import { useThemeStore } from "@stores/theme.store";
import "@mdxeditor/editor/style.css";
import Button from "@components/extras/button";
import Modal from "@components/extras/modal";
import { CircleHelp } from "lucide-preact"; // Added Help Icon
import { useContext, useRef, useState } from "preact/hooks"; // Added useState
import type {
	FieldValues,
	Path,
	PathValue,
	UseFormReturn,
} from "react-hook-form";
import { anidarPropiedades } from ".";
import { FormControlContext } from "./form";

interface FormMKDEditorProps<T extends object> {
	title: string;
	name: Path<T>;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
}

/**
 * FormMKDEditor - Markdown Editor Component using MDXEditor
 * Integrates with react-hook-form via FormControlContext
 */
export function FormMKDEditor<T extends object>({
	name,
	title,
	placeholder = "Escribe tu contenido en Markdown...",
	required = false,
	disabled = false,
	className,
}: FormMKDEditorProps<T>) {
	const themeStore = useThemeStore();
	const editorRef = useRef<MDXEditorMethods>(null);
	const [showHelp, setShowHelp] = useState(false);

	const {
		formState: { errors },
		setValue,
		watch,
	} = useContext<UseFormReturn<T, unknown, FieldValues>>(FormControlContext);

	const err = anidarPropiedades(errors, (name as string).split("."));
	const nameId = `${name}-${Math.random().toString(32)}`;
	const currentValue = (watch(name as unknown as Path<T>) as string) || "";

	const handleChange = (markdown: string) => {
		setValue(name as unknown as Path<T>, markdown as PathValue<T, Path<T>>);
	};

	return (
		<div class={cn("w-full mb-2 space-y-2", className)}>
			<label
				class="block text-sm font-light text-foreground"
				htmlFor={nameId as string}
			>
				{title}
				{required ? <span class="text-primary">*</span> : ""}
			</label>

			<div
				class={cn(
					"w-full rounded-[var(--radius-lg)] border bg-background",
					Object.keys(err).length ? "border-destructive!" : "border-input",
					disabled && "opacity-50 pointer-events-none",
				)}
			>
				<MDXEditor
					ref={editorRef}
					key={themeStore.state}
					markdown={currentValue}
					onChange={handleChange}
					placeholder={placeholder}
					readOnly={disabled}
					className={cn(
						"min-h-[200px]",
						themeStore.state === "dark" ? "dark-theme dark-editor" : "",
					)}
					translation={(key, defaultValue) => {
						const translations: Record<string, string> = {
							"toolbar.undo": "Deshacer",
							"toolbar.redo": "Rehacer",
							"toolbar.bold": "Negrita",
							"toolbar.italic": "Cursiva",
							"toolbar.underline": "Subrayado",
							"toolbar.code": "Código",
							"toolbar.blockTypeSelect.selectBlockTypeTooltip":
								"Tipo de bloque",
							"toolbar.blockTypeSelect.placeholder": "Párrafo",
							"toolbar.blockTypeSelect.paragraph": "Párrafo",
							"toolbar.blockTypeSelect.heading": "Título",
							"toolbar.blockTypeSelect.heading1": "Título 1",
							"toolbar.blockTypeSelect.heading2": "Título 2",
							"toolbar.blockTypeSelect.heading3": "Título 3",
							"toolbar.blockTypeSelect.heading4": "Título 4",
							"toolbar.blockTypeSelect.quote": "Cita",
							"toolbar.lists.bullet": "Lista con viñetas",
							"toolbar.lists.number": "Lista numerada",
							"toolbar.link.open": "Insertar enlace",
							"toolbar.image.open": "Insertar imagen",
							"toolbar.table.open": "Insertar tabla",
							"toolbar.thematicBreak": "Separador horizontal",
							"toolbar.diffSource": "Ver código fuente",
							"dialog.link.linkUrl": "URL del enlace",
							"dialog.link.linkTitle": "Título del enlace",
							"dialog.link.save": "Guardar",
							"dialog.link.cancel": "Cancelar",
							"dialog.image.url": "URL de la imagen",
							"dialog.image.alt": "Texto alternativo",
							"dialog.image.title": "Título de la imagen",
							"dialog.image.save": "Guardar",
							"dialog.image.cancel": "Cancelar",
							"dialog.table.rows": "Filas",
							"dialog.table.columns": "Columnas",
							"dialog.table.save": "Insertar",
							"dialog.table.cancel": "Cancelar",
						};
						return translations[key] || defaultValue || key;
					}}
					contentEditableClassName="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none text-foreground"
					plugins={[
						headingsPlugin(),
						listsPlugin(),
						quotePlugin(),
						thematicBreakPlugin(),
						markdownShortcutPlugin(),
						linkPlugin(),
						linkDialogPlugin(),
						imagePlugin({
							imageUploadHandler: async (image: File) => {
								// Convert file to Base64/Blob to display immediately without server upload
								return new Promise((resolve, reject) => {
									const reader = new FileReader();
									reader.onloadend = () => {
										resolve(reader.result as string);
									};
									reader.onerror = reject;
									reader.readAsDataURL(image);
								});
							},
						}),
						tablePlugin(),
						codeBlockPlugin({ defaultCodeBlockLanguage: "typescript" }),
						codeMirrorPlugin({
							codeBlockLanguages: {
								js: "JavaScript",
								ts: "TypeScript",
								tsx: "TypeScript (React)",
								jsx: "JavaScript (React)",
								css: "CSS",
								html: "HTML",
								json: "JSON",
								bash: "Bash",
								sql: "SQL",
								python: "Python",
							},
						}),
						diffSourcePlugin(),
						frontmatterPlugin(),
						toolbarPlugin({
							toolbarContents: () => (
								<div class="flex flex-wrap gap-1 p-2 border-b border-input bg-muted/40 items-center">
									<UndoRedo />
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<BoldItalicUnderlineToggles />
									<CodeToggle />
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<BlockTypeSelect />
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<ListsToggle />
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<CreateLink />
									<InsertImage />
									<InsertTable />
									<InsertThematicBreak />
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<DiffSourceToggleWrapper>
										<div />
									</DiffSourceToggleWrapper>
									<span class="w-px h-6 bg-border mx-1 my-auto" />
									<button
										type="button"
										title="Ayuda Markdown"
										onClick={() => setShowHelp(true)}
										class="p-1 hover:bg-accent rounded-[var(--radius-lg)] transition-colors"
									>
										<CircleHelp size={20} />
									</button>
								</div>
							),
						}),
					]}
				/>
				{/* Help Modal */}
				<Modal isOpen={showHelp} onClose={() => setShowHelp(false)}>
					<div class="p-1 max-h-[70vh] overflow-y-auto space-y-4 text-sm">
						<h3 class="text-lg font-semibold flex items-center gap-2 mb-4">
							<CircleHelp size={20} class="text-primary" />
							Guía Rápida de Markdown
						</h3>
						<section class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<h4 class="font-medium text-primary">Texto Básico</h4>
								<div class="bg-muted/50 p-2 rounded-[var(--radius-lg)] border border-border">
									<p>
										**Negrita** → <b>Negrita</b>
									</p>
									<p>
										*Cursiva* → <i>Cursiva</i>
									</p>
									<p>
										~~Tachado~~ → <s>Tachado</s>
									</p>
								</div>
							</div>
							<div class="space-y-2">
								<h4 class="font-medium text-primary">Encabezados</h4>
								<div class="bg-muted/50 p-2 rounded-[var(--radius-lg)] border border-border">
									<p># Título 1</p>
									<p>## Título 2</p>
									<p>### Título 3</p>
								</div>
							</div>
						</section>

						<section class="space-y-2">
							<h4 class="font-medium text-primary">Listas</h4>
							<div class="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-[var(--radius-lg)] border border-border">
								<div>
									<p class="text-xs font-semibold mb-1">No ordenada</p>
									<p>- Elemento 1</p>
									<p>- Elemento 2</p>
								</div>
								<div>
									<p class="text-xs font-semibold mb-1">Ordenada</p>
									<p>1. Primero</p>
									<p>2. Segundo</p>
								</div>
							</div>
						</section>

						<section class="space-y-2">
							<h4 class="font-medium text-primary">Elementos Avanzados</h4>
							<div class="bg-muted/50 p-3 rounded-[var(--radius-lg)] border border-border space-y-2">
								<p>
									<span class="text-muted-foreground">
										[Texto del enlace](url)
									</span>{" "}
									→ Enlace
								</p>
								<p>
									<span class="text-muted-foreground">![Alt imagen](url)</span>{" "}
									→ Imagen
								</p>
								<p>
									<span class="text-muted-foreground">`código`</span> → Código
									en línea
								</p>
								<p>
									<span class="text-muted-foreground">```lenguaje</span>
									<br />
									Bloque de código
									<br />
									<span class="text-muted-foreground">```</span>
								</p>
								<p>
									<span class="text-muted-foreground"> Cita</span> → Blockquote
								</p>
							</div>
						</section>

						<div class="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-[var(--radius-lg)] text-xs">
							💡 <b>Tip:</b> Puedes arrastrar y soltar imágenes directamente en
							el editor.
						</div>

						<div class="flex justify-end pt-2">
							<Button onClick={() => setShowHelp(false)}>Entendido</Button>
						</div>
					</div>
				</Modal>
			</div>

			{Object.keys(err).length ? (
				<p class="text-sm text-destructive flex items-center gap-1 mt-2">
					{err?.message}
				</p>
			) : (
				<span class="h-5 w-full block" />
			)}

			<style jsx>{`
        .dark-editor {
          --accentBase: var(--color-primary);
          --accentBgSubtle: var(--color-card);
          --accentBg: var(--color-muted);
          --accentText: var(--color-foreground);
          --baseBase: var(--color-background);
          --baseBgSubtle: var(--color-card);
          --baseBg: var(--color-background);
          --baseText: var(--color-foreground);
          --baseBorder: var(--color-border);
        }

        .dark-editor .mdxeditor {
          background: var(--color-card);
          color: var(--color-foreground);
        }

        .dark-editor [contenteditable] {
          background: var(--color-card);
          color: var(--color-foreground);
        }
      `}</style>
		</div>
	);
}

// export default FormMKDEditor;
