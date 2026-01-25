import type { FieldErrors } from "react-hook-form";
import WebFormVigilio from "./WebForm";
import WebFormArray from "./WebFormArray";
import WebFormButtonSubmit from "./WebFormButtonSubmit";
import FormControl from "./WebFormControl";
import WebFormFile from "./WebFormFile";
import WebFormSelect from "./WebFormSelect";
import WebFormSelectInput from "./WebFormSelectInput";

export { anidarPropiedades } from "./utils";

import { FormToggle } from "../form/FormToggle";
import WebFormArea from "./WebFormArea";

const WebForm = Object.assign(WebFormVigilio, {
	control: Object.assign(FormControl, {
		file: WebFormFile,
		select: WebFormSelect,
		array: WebFormArray,
		selectInput: WebFormSelectInput,
		area: WebFormArea,
		toggle: FormToggle,
	}),
	button: { submit: WebFormButtonSubmit },
});
export default WebForm;
