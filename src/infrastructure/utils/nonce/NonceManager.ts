import crypto from "crypto";
import logger from "../../logging/winston/AppLogger";

export class NonceManager {
  /**
   * Generate a new nonce for backend-to-backend communication
   * Each call generates a fresh, unique nonce
   */
  static async generateNonce(): Promise<string> {
    try {
      // Generate random bytes
      const randomBytes = crypto.randomBytes(32);
      const base64String = randomBytes.toString("base64");

      // Add timestamp
      const timestamp = Date.now().toString(36);

      // Format: base64-timestamp36
      const nonce = `${base64String}-${timestamp}`;

      logger.debug(`[NonceManager] Generated nonce: ${nonce}`);
      return nonce;
    } catch (error) {
      logger.error(`[NonceManager] Failed to generate nonce:`, error);
      throw new Error("Failed to generate nonce");
    }
  }
}
