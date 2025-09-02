import { ReactNode } from 'react';

export enum DropdownType {
  Dropdown = 'Dropdown',
  ContextMenu = 'Context Menu',
}

export interface FieldControlProps {
  fieldTitle?: string;
  optional?: boolean;
}

export interface InputFieldBaseProps extends FieldControlProps {
  placeholder?: string;
  value?: string | number;
  elementId: string;
  elementCssClass?: string;
  containerCssClass?: string;
  disabled?: boolean;
  invalid?: boolean;
  errorText?: string;
  iconAfterInput?: ReactNode;
  iconBeforeInput?: ReactNode;
  iconAfterTitle?: ReactNode;
  labelCssClass?: string;
}

export interface DropdownItemsModel {
  id: string;
  name: string;
  content?: ReactNode;
  icon?: ReactNode;
  selectedContent?: ReactNode;
  sectionStart?: boolean;
  sectionEnd?: boolean;
}
