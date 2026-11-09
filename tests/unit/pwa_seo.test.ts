import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import fs from "fs";
import path from "path";

describe("PWA and SEO Architecture", () => {
  it("renders compliant robots.txt configuration with studio protected", () => {
    const config = robots();
    expect(config.rules).toBeDefined();
    
    // Ensure array form
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
    expect(rules[0].disallow).toContain("/studio/");
    expect(rules[0].disallow).toContain("/api/");
    expect(config.sitemap).toContain("/sitemap.xml");
  });

  it("validates PWA web manifest contains dark luxury champagne aesthetic and standalone mode", () => {
    const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifestContent.name).toContain("Astrox");
    expect(manifestContent.short_name).toBe("Astrox");
    expect(manifestContent.display).toBe("standalone");
    expect(manifestContent.background_color).toBe("#07070A");
    expect(manifestContent.theme_color).toBe("#07070A");
    expect(manifestContent.icons.length).toBeGreaterThan(0);
    expect(manifestContent.icons[0].src).toBe("/brand/astrox-mark.svg");
  });

  it("verifies service worker file is present for offline capability", () => {
    const swPath = path.resolve(process.cwd(), "public/sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("astrox-cache-v1");
    expect(swContent).toContain("install");
    expect(swContent).toContain("fetch");
  });
});
