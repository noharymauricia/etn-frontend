"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";

import styles from "@/components/ui/AppCombobox.module.css";

export type AppComboboxOption = {
  label: string;
  value: string;
  description?: string;
};

type AppComboboxProps = {
  value: string;
  options: AppComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  onChange: (value: string) => void;
};

export default function AppCombobox({
  value,
  options,
  placeholder,
  emptyText = "Aucun resultat.",
  ariaLabel,
  onChange,
}: AppComboboxProps) {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox.Root
      items={options}
      value={selectedOption}
      onValueChange={(nextValue) => onChange(nextValue?.value ?? "")}
    >
      <div className={styles.root}>
        <Combobox.InputGroup className={styles.inputGroup}>
          <Combobox.Input
            placeholder={placeholder}
            aria-label={ariaLabel}
            className={styles.input}
          />
          <div className={styles.actions}>
            <Combobox.Trigger className={styles.iconButton} aria-label="Ouvrir la liste">
              <ChevronDownIcon className={styles.icon} />
            </Combobox.Trigger>
          </div>
        </Combobox.InputGroup>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className={styles.positioner} sideOffset={6}>
          <Combobox.Popup className={styles.popup}>
            <Combobox.Empty className={styles.empty}>{emptyText}</Combobox.Empty>
            <Combobox.List className={styles.list}>
              {(item: AppComboboxOption) => (
                <Combobox.Item key={item.value} value={item} className={styles.item}>
                  <Combobox.ItemIndicator className={styles.indicator}>
                    <CheckIcon className={styles.icon} />
                  </Combobox.ItemIndicator>
                  <div className={styles.itemText}>
                    <div className={styles.itemLabel}>{item.label}</div>
                    {item.description && (
                      <div className={styles.itemDescription}>{item.description}</div>
                    )}
                  </div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg fill="currentColor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function ClearIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
