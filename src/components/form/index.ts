import { FormArea as FormControlArea } from "./form-area";
import { FormArray } from "./form-array";
import { FormButton } from "./form-button";
import { FormButtonSubmit } from "./form-button-submit";
import { FormCheck } from "./form-check";
import { FormColor } from "./form-color";
import { FormControlContext, Form as VigilioForm } from "./form-component";
import { FormControl } from "./form-control";
import { FormDocumentArray } from "./form-document-array";
import { FormFile } from "./form-file";
import { FormMultiSelect } from "./form-multi-select";
import { FormSelect } from "./form-select";
import { FormSelectInput } from "./form-select-input";
import { FormToggle } from "./form-toggle";

export { formSelectNumber } from "./form-select";
export { FormControlContext };

export * from "./libs";

const Form = Object.assign(VigilioForm, {
	control: Object.assign(FormControl, {
		file: FormFile,
		toggle: FormToggle,
		select: FormSelect,
		area: FormControlArea,
		array: FormArray,
		check: FormCheck,
		selectInput: FormSelectInput,
		color: FormColor,
		button: FormButton,
		multiSelect: FormMultiSelect,
		documentArray: FormDocumentArray,
	}),
	button: { submit: FormButtonSubmit },
});
export default Form;
