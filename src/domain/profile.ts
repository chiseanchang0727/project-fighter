export interface UserProfile {
  id: string;
  name: string;
}

// Extend this profile as more personal details become available.
export const DEFAULT_PROFILE: UserProfile = { id: "debbie", name: "Debbie" };

// Shared active profile for Home, Settings, and personalized encouragements.
export const CURRENT_PROFILE: UserProfile = DEFAULT_PROFILE;
