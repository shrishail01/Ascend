export class SubscriptionDTO {
  id: string;
  userId: string;
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;

  constructor(sub: any) {
    this.id = sub._id.toString();
    this.userId = sub.userId.toString();
    this.plan = sub.plan;
    this.status = sub.status;
    this.startDate = sub.startDate ? (sub.startDate instanceof Date ? sub.startDate.toISOString() : sub.startDate) : undefined;
    this.endDate = sub.endDate ? (sub.endDate instanceof Date ? sub.endDate.toISOString() : sub.endDate) : undefined;
  }
}
export default SubscriptionDTO;
