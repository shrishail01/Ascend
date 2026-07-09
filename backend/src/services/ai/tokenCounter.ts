/**
 * Token Counter Service.
 * Provides character-to-token approximations for estimating payload lengths.
 */
export class TokenCounter {
  /**
   * Approximates token count based on a 4-character-per-token word average.
   */
  static approximate(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
}

export default TokenCounter;
