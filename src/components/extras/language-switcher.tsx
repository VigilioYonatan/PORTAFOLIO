import { LANGUAGES } from "@infrastructure/types/i18n";
import { cn } from "@infrastructure/utils/client/cn";
import { Globe } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";

interface LanguageSwitcherProps {
	className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
	const languages = LANGUAGES.map((lang) => ({
		code: lang,
		label: lang.toUpperCase(),
	}));

	const [currentLang, setCurrentLang] = useState<string>("es");

	useEffect(() => {
		const path = window.location.pathname;
		const segments = path.split("/").filter(Boolean);
		const lang = segments[0];
		if (lang && (LANGUAGES as readonly string[]).includes(lang)) {
			setCurrentLang(lang);
		} else {
			// Fallback logic if root or unknown
			setCurrentLang("es");
		}
	}, []);

	const changeLanguage = (langCode: string) => {
		const currentPath = window.location.pathname;
		const segments = currentPath.split("/").filter(Boolean);

		let newPath = "";
		if (
			segments.length > 0 &&
			(LANGUAGES as readonly string[]).includes(segments[0])
		) {
			segments[0] = langCode;
			newPath = `/${segments.join("/")}`;
		} else {
			newPath = `/${langCode}${currentPath === "/" ? "" : currentPath}`;
		}
		window.location.href = newPath;
	};

	return (
		<div class={cn("flex flex-col gap-2", className)}>
			<div class="flex items-center gap-2 mb-1 opacity-50">
				<Globe size={12} />
				<span class="text-[9px] font-mono tracking-widest uppercase">
					Locales
				</span>
			</div>
			<div class="flex gap-2">
				{languages.map((l) => (
					<button
						key={l.code}
						type="button"
						onClick={() => changeLanguage(l.code)}
						aria-label={`Switch to ${l.label}`}
						class={cn(
							"px-2 py-1 text-[10px] rounded-(--radius-sm) border transition-all font-bold uppercase",
							currentLang === l.code
								? "bg-primary text-black border-primary shadow-(0_0_10px_rgba(var(--primary-rgb),0.4))"
								: "bg-white/5 border-white/10 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-white/10",
						)}
					>
						{l.label}
					</button>
				))}
			</div>
		</div>
	);
}
