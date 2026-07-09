/**
 * Response Parser Service.
 * Cleans backticks markdown wrappers and parses structured JSON payload inputs.
 */
export class ResponseParser {
  /**
   * Cleans markdown JSON containers and parses text output into typed objects.
   */
  static parseCleanJSON<T>(text: string): T {
    if (!text) {
      throw new Error('Empty AI response content');
    }

    let cleaned = text.trim();

    // Strip markdown code blocks
    if (cleaned.startsWith('```')) {
      cleaned = cleaned
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/```$/, '')
        .trim();
    }

    // Strip control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    try {
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      // Attempt boundary slice recovery
      const jsonStart = cleaned.indexOf('{');
      const jsonArrayStart = cleaned.indexOf('[');
      let startIdx = -1;
      let endIdx = -1;

      if (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) {
        startIdx = jsonStart;
        endIdx = cleaned.lastIndexOf('}');
      } else if (jsonArrayStart !== -1) {
        startIdx = jsonArrayStart;
        endIdx = cleaned.lastIndexOf(']');
      }

      if (startIdx !== -1 && endIdx !== -1) {
        const sliced = cleaned.substring(startIdx, endIdx + 1);
        try {
          return JSON.parse(sliced) as T;
        } catch {
          // Fall through to original error
        }
      }
      throw new Error(`Failed to parse response JSON: ${err.message}. Content: ${text}`);
    }
  }
}

export default ResponseParser;
