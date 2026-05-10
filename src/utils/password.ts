import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
    password: string,
    passwordHash: string,
): Promise<boolean> => {
    return bcrypt.compare(password, passwordHash);
};

export const createDefaultPassword = (name: string): string => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 4);
    return `${base || "user"}123`;
};
