import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  Button,
  Input,
  Textarea,
  SearchInput,
  FormField,
  Checkbox,
  Toggle,
  SegmentedControl,
  Combobox,
  TagsInput,
  FileUpload,
  RadioGroup,
  NumberInput,
  DatePicker,
  DateRangePicker,
  CharacterCounter,
  InlineEdit,
} from '../../../../src/index';

// ─── Demo wrappers ───────────────────────────────────────────────────

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      checked={checked}
      onChange={setChecked}
      label="Accept terms and conditions"
    />
  );
}

function ToggleDemo() {
  const [on, setOn] = useState(false);
  return <Toggle checked={on} onChange={setOn} label="Enable notifications" />;
}

function SegmentedControlDemo() {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

function ComboboxDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ maxWidth: 300 }}>
      <Combobox
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'angular', label: 'Angular' },
          { value: 'svelte', label: 'Svelte' },
          { value: 'solid', label: 'SolidJS' },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Search frameworks..."
      />
    </div>
  );
}

function TagsInputDemo() {
  const [tags, setTags] = useState(['React', 'TypeScript']);
  return (
    <div style={{ maxWidth: 400 }}>
      <TagsInput value={tags} onChange={setTags} placeholder="Add technology..." maxTags={5} />
    </div>
  );
}

function RadioGroupDemo() {
  const [value, setValue] = useState('monthly');
  return (
    <RadioGroup
      label="Billing cycle"
      options={[
        { value: 'monthly', label: 'Monthly', description: 'Pay each month' },
        { value: 'annual', label: 'Annual', description: 'Save 20% per year' },
        { value: 'lifetime', label: 'Lifetime', description: 'One-time payment' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

function NumberInputDemo() {
  const [value, setValue] = useState<number | ''>(5);
  return <NumberInput value={value} onChange={setValue} min={0} max={100} step={1} suffix="units" />;
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker value={date} onChange={setDate} />;
}

function DateRangePickerDemo() {
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  return <DateRangePicker value={range} onChange={setRange} />;
}

function CharacterCounterDemo() {
  const [text, setText] = useState('Hello world');
  return (
    <div style={{ maxWidth: 300 }}>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
        rows={2}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <CharacterCounter current={text.length} max={140} />
      </div>
    </div>
  );
}

function InlineEditDemo() {
  const [value, setValue] = useState('Click to edit me');
  return (
    <div style={{ fontSize: '1rem' }}>
      <InlineEdit value={value} onChange={setValue} />
    </div>
  );
}

// ─── Forms group ─────────────────────────────────────────────────────

export const formsGroup: ComponentDef[] = [
  {
    name: 'Button',
    description: 'Primary action trigger with variants.',
    file: 'Button.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    ),
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'danger' | 'ghost'", required: false, default: "'primary'", description: 'Visual style variant.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Button size.' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Show loading spinner and disable interactions.' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Icon element to render alongside text.' },
      { name: 'iconPosition', type: "'left' | 'right'", required: false, default: "'left'", description: 'Position of the icon relative to text.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Button label content.' },
    ],
  },
  {
    name: 'Input',
    description: 'Text input field with variants.',
    file: 'Input.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
        <Input placeholder="Default input" />
        <Input placeholder="With error" error="This field is required" />
        <Input placeholder="Disabled" disabled />
      </div>
    ),
    props: [
      { name: 'label', type: 'string', required: false, description: 'Label text above the input.' },
      { name: 'error', type: 'string', required: false, description: 'Error message displayed below the input.' },
    ],
  },
  {
    name: 'Textarea',
    description: 'Multi-line text input.',
    file: 'Textarea.tsx',
    demo: () => <Textarea placeholder="Write something..." rows={3} />,
    props: [
      { name: 'label', type: 'string', required: false, description: 'Label text above the textarea.' },
      { name: 'error', type: 'string', required: false, description: 'Error message displayed below the textarea.' },
    ],
  },
  {
    name: 'SearchInput',
    description: 'Input with search icon.',
    file: 'SearchInput.tsx',
    demo: () => <SearchInput placeholder="Search..." value="" onChange={() => {}} />,
    props: [
      { name: 'value', type: 'string', required: false, description: 'Current input value.' },
      { name: 'onClear', type: '() => void', required: false, description: 'Callback to clear the input. Shows an X button when value is non-empty.' },
    ],
  },
  {
    name: 'FormField',
    description: 'Label + input + error wrapper.',
    file: 'FormField.tsx',
    demo: () => (
      <FormField label="Email" error="Invalid email address">
        <Input placeholder="you@example.com" error="Invalid email address" />
      </FormField>
    ),
    props: [
      { name: 'label', type: 'string', required: true, description: 'Field label text.' },
      { name: 'required', type: 'boolean', required: false, description: 'Show required indicator.' },
      { name: 'error', type: 'string', required: false, description: 'Error message below the field.' },
      { name: 'hint', type: 'string', required: false, description: 'Hint text below the field.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Form control element.' },
      { name: 'htmlFor', type: 'string', required: false, description: 'Explicit ID for the label. Auto-generated if omitted.' },
    ],
  },
  {
    name: 'Checkbox',
    description: 'Boolean toggle with label.',
    file: 'Checkbox.tsx',
    demo: () => <CheckboxDemo />,
    props: [
      { name: 'label', type: 'string', required: false, description: 'Label text beside the checkbox.' },
      { name: 'checked', type: 'boolean', required: false, default: 'false', description: 'Checked state.' },
      { name: 'indeterminate', type: 'boolean', required: false, default: 'false', description: 'Indeterminate (partial) state.' },
      { name: 'onChange', type: '(checked: boolean) => void', required: false, description: 'Callback when checked changes.' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disable the checkbox.' },
    ],
  },
  {
    name: 'Toggle',
    description: 'Switch-style boolean toggle.',
    file: 'Toggle.tsx',
    demo: () => <ToggleDemo />,
    props: [
      { name: 'checked', type: 'boolean', required: true, description: 'Toggle on/off state.' },
      { name: 'onChange', type: '(checked: boolean) => void', required: true, description: 'Callback when toggled.' },
      { name: 'label', type: 'string', required: false, description: 'Label text beside the toggle.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the toggle.' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: 'Toggle size.' },
    ],
  },
  {
    name: 'SegmentedControl',
    description: 'Mutually exclusive option selector.',
    file: 'SegmentedControl.tsx',
    demo: () => <SegmentedControlDemo />,
    props: [
      { name: 'options', type: 'SegmentedControlOption[]', required: true, description: 'Array of { value: string; label: string; disabled?: boolean } options.' },
      { name: 'value', type: 'string', required: true, description: 'Currently selected value.' },
      { name: 'onChange', type: '(value: string) => void', required: true, description: 'Callback when selection changes.' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: 'Control size.' },
    ],
  },
  {
    name: 'Combobox',
    description: 'Searchable dropdown with keyboard navigation.',
    file: 'Combobox.tsx',
    demo: () => <ComboboxDemo />,
    props: [
      { name: 'options', type: 'ComboboxOption[]', required: true, description: 'Array of { value: string; label: string; disabled?: boolean } options.' },
      { name: 'value', type: 'string', required: false, description: 'Currently selected value.' },
      { name: 'onChange', type: '(value: string) => void', required: false, description: 'Callback when an option is selected.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Search...'", description: 'Input placeholder text.' },
      { name: 'onSearch', type: '(query: string) => void', required: false, description: 'External search handler. When provided, client-side filtering is disabled.' },
      { name: 'emptyMessage', type: 'string', required: false, default: "'No results found'", description: 'Message when no options match the query.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the combobox.' },
    ],
  },
  {
    name: 'TagsInput',
    description: 'Input for managing a list of tags with add/remove.',
    file: 'TagsInput.tsx',
    demo: () => <TagsInputDemo />,
    props: [
      { name: 'value', type: 'string[]', required: true, description: 'Current array of tags.' },
      { name: 'onChange', type: '(tags: string[]) => void', required: true, description: 'Callback when tags change.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Add tag...'", description: 'Input placeholder when empty.' },
      { name: 'maxTags', type: 'number', required: false, description: 'Maximum number of tags allowed.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the input.' },
    ],
  },
  {
    name: 'FileUpload',
    description: 'Drag-and-drop file upload zone.',
    file: 'FileUpload.tsx',
    demo: () => (
      <div style={{ maxWidth: 400 }}>
        <FileUpload
          onFiles={(files) => console.log('Files:', files)}
          accept=".png,.jpg,.pdf"
          maxSizeMB={10}
        />
      </div>
    ),
    props: [
      { name: 'onFiles', type: '(files: File[]) => void', required: true, description: 'Callback with selected/dropped files.' },
      { name: 'accept', type: 'string', required: false, description: 'Accepted file types (e.g., ".png,.jpg,.pdf").' },
      { name: 'multiple', type: 'boolean', required: false, default: 'false', description: 'Allow multiple file selection.' },
      { name: 'maxSizeMB', type: 'number', required: false, description: 'Maximum file size in MB. Shows validation error if exceeded.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the upload zone.' },
      { name: 'children', type: 'ReactNode', required: false, description: 'Custom content inside the drop zone.' },
    ],
  },
  {
    name: 'RadioGroup',
    description: 'Single-select option group with keyboard navigation.',
    file: 'RadioGroup.tsx',
    demo: () => <RadioGroupDemo />,
    props: [
      { name: 'options', type: 'RadioGroupOption[]', required: true, description: 'Array of { value: string; label: string; description?: string; disabled?: boolean } options.' },
      { name: 'value', type: 'string', required: true, description: 'Currently selected value.' },
      { name: 'onChange', type: '(value: string) => void', required: true, description: 'Callback when selection changes.' },
      { name: 'orientation', type: "'vertical' | 'horizontal'", required: false, default: "'vertical'", description: 'Layout direction of options.' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: 'Radio button size.' },
      { name: 'label', type: 'string', required: false, description: 'Accessible group label (aria-label).' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disable all options.' },
    ],
  },
  {
    name: 'NumberInput',
    description: 'Numeric input with increment/decrement buttons and keyboard support.',
    file: 'NumberInput.tsx',
    demo: () => <NumberInputDemo />,
    props: [
      { name: 'value', type: "number | ''", required: true, description: 'Current numeric value or empty string.' },
      { name: 'onChange', type: "(value: number | '') => void", required: true, description: 'Callback when value changes.' },
      { name: 'min', type: 'number', required: false, description: 'Minimum allowed value.' },
      { name: 'max', type: 'number', required: false, description: 'Maximum allowed value.' },
      { name: 'step', type: 'number', required: false, default: '1', description: 'Increment/decrement step size.' },
      { name: 'prefix', type: 'string', required: false, description: 'Prefix text (e.g., "$").' },
      { name: 'suffix', type: 'string', required: false, description: 'Suffix text (e.g., "kg").' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Input size.' },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the input.' },
      { name: 'label', type: 'string', required: false, description: 'Accessible label (visually hidden).' },
    ],
  },
  {
    name: 'DatePicker',
    description: 'Calendar date picker with keyboard navigation.',
    file: 'DatePicker.tsx',
    demo: () => <DatePickerDemo />,
    props: [
      { name: 'value', type: 'Date | null', required: false, description: 'Selected date.' },
      { name: 'onChange', type: '(date: Date | null) => void', required: true, description: 'Callback when date is selected.' },
      { name: 'min', type: 'Date', required: false, description: 'Minimum selectable date.' },
      { name: 'max', type: 'Date', required: false, description: 'Maximum selectable date.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Select date'", description: 'Trigger button placeholder text.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the picker.' },
      { name: 'locale', type: 'string', required: false, default: "'en-US'", description: 'Locale for date formatting (Intl.DateTimeFormat).' },
    ],
  },
  {
    name: 'DateRangePicker',
    description: 'Dual-calendar date range selector with presets.',
    file: 'DateRangePicker.tsx',
    demo: () => <DateRangePickerDemo />,
    props: [
      { name: 'value', type: '{ from: Date | null; to: Date | null }', required: true, description: 'Selected date range.' },
      { name: 'onChange', type: '(range: DateRange) => void', required: true, description: 'Callback when range changes.' },
      { name: 'presets', type: 'Preset[]', required: false, description: 'Quick-select presets. Defaults to Last 7/30 days, This month, Last 3 months.' },
      { name: 'min', type: 'Date', required: false, description: 'Minimum selectable date.' },
      { name: 'max', type: 'Date', required: false, description: 'Maximum selectable date.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Select range'", description: 'Trigger button placeholder text.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the picker.' },
      { name: 'locale', type: 'string', required: false, default: "'en-US'", description: 'Locale for date formatting.' },
    ],
  },
  {
    name: 'CharacterCounter',
    description: 'Displays character count with warning and error states.',
    file: 'CharacterCounter.tsx',
    demo: () => <CharacterCounterDemo />,
    props: [
      { name: 'current', type: 'number', required: true, description: 'Current character count.' },
      { name: 'max', type: 'number', required: true, description: 'Maximum character limit.' },
      { name: 'warnAt', type: 'number', required: false, default: '0.9', description: 'Warning threshold as fraction of max (0-1).' },
      { name: 'showRemaining', type: 'boolean', required: false, default: 'false', description: 'Show remaining count instead of current count.' },
    ],
  },
  {
    name: 'InlineEdit',
    description: 'Click-to-edit inline text field with confirm/cancel.',
    file: 'InlineEdit.tsx',
    demo: () => <InlineEditDemo />,
    props: [
      { name: 'value', type: 'string', required: true, description: 'Current text value.' },
      { name: 'onChange', type: '(value: string) => void', required: true, description: 'Callback when value is committed.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Haz clic para editar...'", description: 'Placeholder shown when value is empty.' },
      { name: 'validate', type: '(value: string) => string | null', required: false, description: 'Validation function. Return error string or null.' },
      { name: 'saveOnBlur', type: 'boolean', required: false, default: 'true', description: 'Auto-save when input loses focus.' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable editing.' },
      { name: 'as', type: "'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'", required: false, default: "'span'", description: 'HTML element used in display mode.' },
      { name: 'inputClassName', type: 'string', required: false, description: 'Additional CSS class for the input element.' },
    ],
  },
];
