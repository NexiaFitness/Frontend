/**
 * Exportador central de componentes de formularios
 * Incluye Input y FormSelect para formularios reutilizables
 * Excluye Button (ahora en carpeta buttons)
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

export { Input } from "./Input";
export { SearchBar } from "./SearchBar";
export { FormSelect } from "./FormSelect";
export { FormCombobox } from "./FormCombobox";
export { DatePickerButton } from "./DatePickerButton";
export { TimePickerButton } from "./TimePickerButton";
export type { TimePickerButtonProps } from "./TimePickerButton";
export { Textarea } from "./Textarea";
export { InlineNumberInput } from "./InlineNumberInput";
export type { InlineNumberSize } from "./InlineNumberInput";
export { Checkbox } from "./Checkbox";
export { Slider } from "./Slider";
export { Label } from "./Label";
export { FormField } from "./FormField";
export { FormSection } from "./FormSection";
export type { FormFieldProps } from "./FormField";
export type { PlatformFormControlVariant } from "./platformFormPresentation";
export {
    PLATFORM_FORM_SHELL,
    PLATFORM_FORM_BODY,
    PLATFORM_FORM_DIVIDER,
    PLATFORM_FORM_SECTION,
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_FORM_FIELD_LABEL,
    PLATFORM_FORM_CONTROL,
    PLATFORM_FORM_OPTIONAL_BLOCK,
    PLATFORM_FORM_NESTED_PANEL,
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_FOOTER_BTN,
} from "./platformFormPresentation";
export { CollapsibleFormGroup } from "./CollapsibleFormGroup";

export type { InputType, InputSize } from "./Input";
export type { SearchBarProps } from "./SearchBar";
export type { SelectOption, SelectSize } from "./FormSelect";
export type { FormComboboxProps, ComboboxOption } from "./FormCombobox";
export type { DatePickerButtonProps } from "./DatePickerButton";
export type { TextareaSize } from "./Textarea";
export type { SliderProps } from "./Slider";
export type { LabelProps } from "./Label";
export type { FormSectionProps } from "./FormSection";
export type { CollapsibleFormGroupProps } from "./CollapsibleFormGroup";

export {
    NEXIA_FORM_CONTROL_BASE,
    NEXIA_FORM_CONTROL_ERROR,
    NEXIA_FORM_CONTROL_FOCUS,
    NEXIA_FORM_CONTROL_HELPER,
    NEXIA_FORM_CONTROL_INPUT,
    NEXIA_FORM_CONTROL_LABEL,
    NEXIA_FORM_CONTROL_SEARCH,
    NEXIA_FORM_CONTROL_SEARCH_ICON,
    NEXIA_FORM_CONTROL_SEARCH_WRAP,
    NEXIA_FORM_CONTROL_SIZE,
    NEXIA_FORM_CONTROL_TEXT,
    NEXIA_FORM_CONTROL_TEXTAREA,
    NEXIA_FORM_CONTROL_TEXTAREA_BASE,
    NEXIA_FORM_CONTROL_TEXTAREA_TEXT,
    nexiaFormControlInputClass,
} from "./formControlPresentation";
export type { NexiaFormControlSize } from "./formControlPresentation";
