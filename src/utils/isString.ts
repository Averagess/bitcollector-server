const isString = (value: unknown): value is string => {
  if(typeof value === "string" || value instanceof String) return true;
  return false;
};

export default isString;
