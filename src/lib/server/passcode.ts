import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a passcode using bcrypt
 * @param passcode - The plaintext passcode to hash
 * @returns The hashed passcode
 */
export async function hashPasscode(passcode: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(passcode, salt);
}

/**
 * Verify a passcode against a hash
 * @param passcode - The plaintext passcode to verify
 * @param hash - The stored hash to compare against
 * @returns True if passcode matches, false otherwise
 */
export async function verifyPasscode(passcode: string, hash: string): Promise<boolean> {
    return bcrypt.compare(passcode, hash);
}
