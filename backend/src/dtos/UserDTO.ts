export class UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  plan: string;
  linkedInUrl?: string;
  currentRole?: string;
  targetRole?: string;
  createdAt: string;

  constructor(user: any) {
    this.id = user._id.toString();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.plan = user.plan;
    this.linkedInUrl = user.linkedInUrl;
    this.currentRole = user.currentRole;
    this.targetRole = user.targetRole;
    this.createdAt = user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
  }
}
export default UserDTO;
