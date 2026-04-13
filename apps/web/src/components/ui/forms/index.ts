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
export { Textarea } from "./Textarea";
export { InlineNumberInput } from "./InlineNumberInput";
export type { InlineNumberSize } from "./InlineNumberInput";
export { Checkbox } from "./Checkbox";
export { Slider } from "./Slider";
export { Label } from "./Label";
export { FormSection } from "./FormSection";
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
