export class LinkedInReviewDTO {
  id: string;
  userId: string;
  profileSection: string;
  originalText: string;
  suggestions: any[];
  createdAt: string;

  constructor(review: any) {
    this.id = review._id.toString();
    this.userId = review.userId.toString();
    this.profileSection = review.profileSection;
    this.originalText = review.originalText;
    try {
      this.suggestions = typeof review.suggestions === 'string' ? JSON.parse(review.suggestions) : review.suggestions;
    } catch {
      this.suggestions = [];
    }
    this.createdAt = review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt;
  }
}
export default LinkedInReviewDTO;
