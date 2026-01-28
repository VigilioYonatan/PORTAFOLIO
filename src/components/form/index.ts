import { Form as VigilioForm, FormControlContext } from "./form-component";
import { FormArea as FormControlArea } from "./form-area";
import { FormButton } from "./form-button";
import { FormButtonSubmit } from "./form-button-submit";
import { FormCheck } from "./form-check";
import { FormControl } from "./form-control";
import { FormMultiSelect } from "./form-multi-select";
import { FormSelect } from "./form-select";
import { FormToggle } from "./form-toggle";
import { FormArray } from "./form-array";
import { FormColor } from "./form-color";
import { FormDocumentArray } from "./form-document-array";
import { FormFile } from "./form-file";
import { FormSelectInput } from "./form-select-input";

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
