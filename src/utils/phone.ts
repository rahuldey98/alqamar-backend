export const normalizePhone = (phone: string): string => {
    // Remove all non-digit characters (including spaces, dashes, etc.)
    const digits = phone.replace(/\D/g, "");

    // If it starts with 91 (Indian country code) and has 12 digits, strip the 91
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }

    // If it starts with 0 and has 11 digits, strip the 0
    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }

    return digits;
};
