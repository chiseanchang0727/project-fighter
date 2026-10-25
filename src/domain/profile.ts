export interface UserProfile {
  name: string;
}

// Extend this profile as more personal details become available.
export const DEFAULT_PROFILE: UserProfile = { name: "Debbie" };
