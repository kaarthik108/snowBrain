export function toMarkdownTable(data: any[]) {
  if (data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const maxColumns = 5;

  const tableHeaders = headers.slice(0, maxColumns).join(" | ");
  const tableDelimiters = headers.fill("---").slice(0, maxColumns).join(" | ");
  const tableRows = data
    .map((row) => {
      const values = Object.values(row);
      if (values.length > maxColumns) {
        return [...values.slice(0, 2), "...", ...values.slice(-2)].join(" | ");
      }
      return values.join(" | ");
    })
    .join("\n");

  return `
${tableHeaders}
${tableDelimiters}
${tableRows}
`;
}
