import { startRouter } from "./app/router.js";

document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

interface DesignProfile {
  profileId: string;
  navigationPattern: "sidebar" | "topbar" | "rail";
  density: "compact" | "comfortable" | "spacious";
}

async function applyDesignProfile(): Promise<void> {
  const response = await fetch("/design/project-profile.json", {
    credentials: "same-origin"
  });
  if (!response.ok) {
    throw new Error("Design profile could not be loaded");
  }

  const profile = (await response.json()) as DesignProfile;
  document.documentElement.dataset.designProfile = profile.profileId;
  document.documentElement.dataset.navigation = profile.navigationPattern;
  document.documentElement.dataset.density = profile.density;
}

await applyDesignProfile();
startRouter();
