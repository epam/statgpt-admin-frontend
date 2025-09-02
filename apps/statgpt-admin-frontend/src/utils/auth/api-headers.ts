export const getApiHeaders = (
  { jwt }: { jwt?: string | unknown },
  isFormData: boolean,
): Record<string, string> => {
  const headers: Record<string, string> = isFormData
    ? {}
    : {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

  if (jwt) {
    headers['authorization'] = 'Bearer ' + jwt;
  }

  return headers;
};
