/**
 * Context Builder Service.
 * Responsible for cleaning context strings, stripping scripts, escaping prompt injection,
 * normalising whitespace, and truncating text payload tokens safely.
 */
export class ContextBuilderService {
  /**
   * Sanitizes input string to prevent script/HTML execution and redacts prompt injection triggers.
   */
  static sanitize(text: string): string {
    if (!text) return '';
    
    // Strip script and standard HTML tags
    let cleaned = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, '');

    // Strip control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    // Escape and redact common adversarial prompt injection patterns
    cleaned = cleaned.replace(
      /(ignore previous instructions|override system prompt|you are now a helpful|instead of the above|disregard instructions)/gi,
      '[REDACTED]'
    );

    return cleaned;
  }

  /**
   * Cleans text content, normalizes whitespaces, and enforces character/token truncation limit.
   */
  static cleanContext(text: string, tokenLimit = 4000): string {
    let sanitized = this.sanitize(text);

    // Normalize multiple spaces/newlines into a single space
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Enforce safety word/char limit (~4 characters per token estimate)
    const charLimit = tokenLimit * 4;
    if (sanitized.length > charLimit) {
      sanitized = sanitized.substring(0, charLimit) + '... [TRUNCATED]';
    }

    return sanitized;
  }
}

export default ContextBuilderService;
