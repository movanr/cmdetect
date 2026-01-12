/**
 * Side checkbox group for Office use (R/L/DNK)
 * R and L can be selected together (bilateral)
 * DNK is mutually exclusive with R/L
 */

export interface OfficeUseValue {
  R?: boolean;
  L?: boolean;
  DNK?: boolean;
}

interface SideCheckboxGroupProps {
  value: OfficeUseValue;
  onChange: (value: OfficeUseValue) => void;
  disabled?: boolean;
}

export function SideCheckboxGroup({
  value,
  onChange,
  disabled = false,
}: SideCheckboxGroupProps) {
  const handleRChange = (checked: boolean) => {
    if (checked) {
      // Selecting R clears DNK
      onChange({ ...value, R: true, DNK: false });
    } else {
      onChange({ ...value, R: false });
    }
  };

  const handleLChange = (checked: boolean) => {
    if (checked) {
      // Selecting L clears DNK
      onChange({ ...value, L: true, DNK: false });
    } else {
      onChange({ ...value, L: false });
    }
  };

  const handleDNKChange = (checked: boolean) => {
    if (checked) {
      // Selecting DNK clears R and L
      onChange({ R: false, L: false, DNK: true });
    } else {
      onChange({ ...value, DNK: false });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground mr-1">Seite:</span>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value.R ?? false}
          onChange={(e) => handleRChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
        />
        <span className="text-sm">Rechts</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value.L ?? false}
          onChange={(e) => handleLChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
        />
        <span className="text-sm">Links</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value.DNK ?? false}
          onChange={(e) => handleDNKChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
        />
        <span className="text-sm text-muted-foreground">Unklar</span>
      </label>
    </div>
  );
}
