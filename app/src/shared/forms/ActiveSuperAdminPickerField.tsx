import type { ReactElement } from "react";

import EntityAutocompleteField from "./EntityAutocompleteField";
import {
  ACTIVE_SUPER_ADMIN_COMBOBOX_LABEL,
  ACTIVE_SUPER_ADMIN_COMBOBOX_NO_OPTIONS_TEXT,
  ACTIVE_SUPER_ADMIN_COMBOBOX_PLACEHOLDER,
  type ActiveSuperAdminOption,
} from "./active-super-admin.util";
import { useActiveSuperAdminSearch } from "./useActiveSuperAdminSearch";

export type { ActiveSuperAdminOption } from "./active-super-admin.util";

export type ActiveSuperAdminPickerFieldProps = {
  readonly value: ActiveSuperAdminOption | null;
  readonly onChange: (value: ActiveSuperAdminOption | null) => void;
  readonly enabled?: boolean;
  readonly required?: boolean;
  readonly fullWidth?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
};

function ActiveSuperAdminPickerField({
  value,
  onChange,
  enabled = true,
  required = false,
  fullWidth = true,
  disabled = false,
  label = ACTIVE_SUPER_ADMIN_COMBOBOX_LABEL,
}: ActiveSuperAdminPickerFieldProps): ReactElement {
  const combobox = useActiveSuperAdminSearch({ value, onChange, enabled });

  return (
    <EntityAutocompleteField
      options={combobox.options}
      value={value}
      inputValue={combobox.inputValue}
      loading={combobox.loading}
      onInputChange={combobox.onInputChange}
      onChange={combobox.onChange}
      noOptionsText={ACTIVE_SUPER_ADMIN_COMBOBOX_NO_OPTIONS_TEXT}
      label={label}
      placeholder={ACTIVE_SUPER_ADMIN_COMBOBOX_PLACEHOLDER}
      imageVariant="circular"
      latinSubtitle
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}

export default ActiveSuperAdminPickerField;
