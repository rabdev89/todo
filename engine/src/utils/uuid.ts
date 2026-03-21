/**
 * UUID Generator Utility
 * 
 * Simple UUID v4 generator for session and query IDs
 */

/**
 * Generate a UUID v4 string
 * @returns UUID string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a short ID (8 characters) for display purposes
 * @returns Short ID string
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}
