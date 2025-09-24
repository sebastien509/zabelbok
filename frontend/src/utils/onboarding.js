// src/utils/onboarding.js
export function needsCreatorOnboarding(user) {
    if (!user) return true;
    // Finish when they have at least a bio AND picked a theme/banner
    return !(user?.bio && user?.theme && user?.banner_url);
  }
  