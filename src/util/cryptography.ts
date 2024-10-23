import crypto from "crypto";

export const randomFourDigits = (): string => {
  const newCode: string = crypto.getRandomValues(new Uint16Array(1)).join("");
  return newCode.length > 4 ? newCode.slice(1, 5) : newCode;
};
