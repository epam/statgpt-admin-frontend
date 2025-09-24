export interface Document {
  id: string;
}

export enum DocumentMetadataPropertyType {
  Array = 'array',
  String = 'string',
}

export interface DocumentMetadataProperty {
  type: DocumentMetadataPropertyType;
  format?: 'date';
}

export type DocumentMetadataProperties = Record<
  // key is property name
  string,
  DocumentMetadataProperty
>;

export interface DocumentMetadataDimension {
  name: string;
  values: string[];
}

export interface DocumentMetadata {
  schema: {
    properties: DocumentMetadataProperties;
  };
  dimensions: DocumentMetadataDimension[];
}
