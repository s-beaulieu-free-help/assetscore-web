import { SiteHeaderBar } from "@/components/site-header-bar";
import { loadViewer, viewerName } from "@/lib/viewer";

export async function SiteHeader() {
  const { user, profile } = await loadViewer();
  return <SiteHeaderBar name={user ? viewerName(profile) : null} />;
}
