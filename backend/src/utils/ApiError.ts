/**
 * Custom operational API Error class representing handled server exceptions.
 */
export class ApiError extends Error {
  statusCode: number;
  success: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export default ApiError;
