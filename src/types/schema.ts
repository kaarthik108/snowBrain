export interface Column {
  name: string;
  type: string;
  constraints: string;
}

export interface Table {
  name: string;
  description: string;
  columns: Column[];
}

export interface DatabaseSchemaProps {
  tables: Table[];
}
