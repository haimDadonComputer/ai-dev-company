document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

interface SiteConfig {
  siteLogo: string;
  siteName: string;
  siteDescription: string;
  siteSlogan: string;
  favicon: string;
  businessPhone: string;
  businessAddress: string;
  businessInstagram: string;
  businessFacebook: string;
  businessWhatsapp: string;
}

async function loadSiteConfig(): Promise<SiteConfig> {
  const response = await fetch("/app/site-config.json", {
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error("Site config could not be loaded");
  }

  return (await response.json()) as SiteConfig;
}

function setMetaTag(name: string, content: string): void {
  if (!content) {
    return;
  }

  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.append(meta);
  }
  meta.content = content;
}

function applySiteConfig(config: SiteConfig): void {
  document.title = config.siteName || "AI Development Company";
  setMetaTag("description", config.siteDescription);

  if (config.favicon) {
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.append(icon);
    }
    icon.href = config.favicon;
  }

  document.documentElement.dataset.siteReady = "true";
}

applySiteConfig(await loadSiteConfig());
