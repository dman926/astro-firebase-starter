// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorFirstLine = (error: any): string =>
  error.toString().split("\n")[0];

export default getErrorFirstLine;
