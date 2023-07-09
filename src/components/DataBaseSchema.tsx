import { DatabaseSchemaProps } from "chat";
import React from "react";

export const DatabaseSchema: React.FC<DatabaseSchemaProps> = ({ tables }) => (
  <div className="space-y-4 ">
    {tables.map((table, i) => (
      <div
        key={i}
        className="p-4 border rounded shadow space-y-2 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-zinc-700"
      >
        <h3 className="text-lg font-bold break-words">{table.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
          {table.description}
        </p>
        <ul className="list-disc list-inside space-y-1">
          {table.columns.map((column, j) => (
            <li key={j} className="text-sm break-words">
              <strong>{column.name}</strong>: {column.type}{" "}
              <em>({column.constraints})</em>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
