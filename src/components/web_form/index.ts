import WebFormVigilio from "./web-form";
import WebFormArray from "./web-form.array";
import WebFormButtonSubmit from "./web-form.button-submit";
import FormControl from "./web-form.control";
import WebFormFile from "./web-form.file";
import WebFormSelect from "./web-form.select";
import WebFormSelectInput from "./web-form.select-input";

export { anidarPropiedades } from "./utils";

import { FormToggle } from "../form/form.toggle";
import WebFormArea from "./web-form.area";

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
