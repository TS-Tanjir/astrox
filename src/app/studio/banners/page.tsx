import { db } from "@/server/db";
import { BannersClient } from "@/components/studio/BannersClient";

export const revalidate = 0;

export default async function StudioBannersPage() {
  const banners = await db.banner.findMany({
    orderBy: { position: "asc" },
  });

  return <BannersClient initialBanners={banners} />;
}
