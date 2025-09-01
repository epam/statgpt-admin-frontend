import {
  DocumentMetadataProperties,
  DocumentMetadataPropertyType,
} from '@/src/models/document';

export const getDocumentParamName = (control: string): string =>
  control
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

export const isMetadataComplete = (
  properties?: DocumentMetadataProperties,
  values: Record<string, string | string[]> = {},
): boolean => {
  if (!properties) {
    return false;
  }

  for (const p in properties) {
    const value = values[p];
    if (properties[p].type === DocumentMetadataPropertyType.String && !value) {
      return false;
    } else if (
      properties[p].type === DocumentMetadataPropertyType.Array &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return false;
    }
  }

  return true;
};
