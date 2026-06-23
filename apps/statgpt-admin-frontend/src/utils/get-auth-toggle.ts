export const getIsEnableAuthToggle = (): boolean => {
  return !!(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL);
};
