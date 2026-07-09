import api from '@/services/axios';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  linkedInUrl?: string;
  currentRole?: string;
  targetRole?: string;
}

export interface UpdateProfileOutput {
  success: boolean;
}

/**
 * Sends profile update request to the backend.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
  return api.patch('/users/me', input);
}
