export const generateShortUrn = (
  id?: string,
  version?: string,
  agency?: string,
): string => {
  const versionStr = version === '' ? '' : `(${version})`;
  return `${agency}:${id}${versionStr}`;
};
