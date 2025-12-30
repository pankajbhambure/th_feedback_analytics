/**
 * OTP Utilities
 * Helper functions for OTP generation and validation
 */

/**
 * Generates a random 6-digit OTP
 * @returns 6-digit numeric string
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculates OTP expiration time
 * @param minutes - Number of minutes until expiration (default: 5)
 * @returns Date object representing expiration time
 */
export const getOtpExpiry = (minutes = 5): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

/**
 * Checks if an OTP has expired
 * @param expiresAt - Expiration date of the OTP
 * @returns True if expired, false otherwise
 */
export const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
