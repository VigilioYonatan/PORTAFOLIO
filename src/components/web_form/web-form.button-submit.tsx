import Loader from "@components/extras/Loader";
import { type JSX } from "preact";

type FormButtonSubmitProps = JSX.IntrinsicElements["button"] & {
	isLoading: boolean;
	loading_title: string;
	title: string;
	className?: string;
	ico?: JSX.Element | JSX.Element[] | null;
	disabled?: boolean;
};
function FormButtonSubmit({
	isLoading,
	title,
	className,
	loading_title,
	disabled = false,
	ico,
	...rest
}: FormButtonSubmitProps) {
	return (
		<button
			type="submit"
			class={`disabled:opacity-50 disabled:cursor-not-allowed text-xs bg-primary py-3 px-8 font-black rounded-none text-primary-foreground tracking-[0.2em] mx-auto uppercase mt-3 flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] ${className} `}
			disabled={disabled}
			{...rest}
		>
			{isLoading ? (
				<>
					<Loader /> {loading_title}
				</>
			) : (
				<>
					{ico || null}
					{title}
				</>
			)}
		</button>
	);
}

export default FormButtonSubmit;
