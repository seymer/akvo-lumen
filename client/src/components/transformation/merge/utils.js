/* eslint-disable import/prefer-default-export */

/*
 * Used by both Source- and TargetMergeOptions to guess the merge column
 * Strategy:
 * - if a column named 'identifier' exists, select it (this is what makes most sense to Flow)
 * - else, pick the first key column,
 * - otherwise return null
 */
export function guessMergeColumn(dataset) {
  const columns = dataset.get('columns');
  const identifierColumn = columns.find(column => column.get('columnName') === 'identifier');
  if (identifierColumn != null) {
    return identifierColumn;
  }
  const keyColumns = columns.filter(column => column.get('key'));
  if (keyColumns.size > 0) {
    return keyColumns.get(0);
  }
  return null;
}

/* Returns the column name, or null if column is null */
export function getColumnName(column) {
  return column == null ? null : column.get('columnName');
}

export function directionLabels(column) {
  const defaultLabels = { asc: 'first', desc: 'last' };
  if (column == null) return defaultLabels;
  switch (column.get('type')) {
    case 'date': return { asc: 'earliest', desc: 'latest' };
    case 'number': return { asc: 'lowest', desc: 'highest' };
    default: return defaultLabels;
  }
}
