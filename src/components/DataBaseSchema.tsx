import { DatabaseSchemaProps } from "@/types/schema";
import React from "react";
import ReactMarkdown from 'react-markdown';

export const DatabaseSchema: React.FC<DatabaseSchemaProps> = ({ tables }) => (
    <div className="space-y-4">
        {tables.map((table, i) => (
            <div key={i}>
                <ReactMarkdown className="markdown break-words">
                    {`
\`\`\`
### ${table.name}

${table.description}

${table.columns.map((column, j) => `- ${column.name}: ${column.type} (${column.constraints})\n`).join('')
                        }
\`\`\`
          `}
                </ReactMarkdown>
            </div>
        ))}
    </div>
);
