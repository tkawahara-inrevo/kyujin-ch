import fs from "fs";
import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerNotoSansJP() {
  if (registered) return;

  const fontsourceDir = path.join(
    process.cwd(),
    "node_modules/@fontsource/noto-sans-jp"
  );
  const filesDir = path.join(fontsourceDir, "files");

  function parseFonts(cssFile: string, fontWeight: "normal" | "bold") {
    const css = fs.readFileSync(path.join(fontsourceDir, cssFile), "utf-8");
    const fonts: {
      src: string;
      fontWeight: "normal" | "bold";
      unicodeRange?: string;
    }[] = [];

    // @font-face ブロックを順に抽出
    const blockRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    while ((match = blockRegex.exec(css)) !== null) {
      const block = match[1];
      const srcMatch = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/);
      const unicodeMatch = block.match(/unicode-range:\s*([^\n;]+)/);
      if (!srcMatch) continue;

      const src = path.join(filesDir, srcMatch[1]);
      const entry: (typeof fonts)[0] = { src, fontWeight };
      if (unicodeMatch) entry.unicodeRange = unicodeMatch[1].trim();
      fonts.push(entry);
    }
    return fonts;
  }

  Font.register({
    family: "NotoSansJP",
    fonts: [
      ...parseFonts("400.css", "normal"),
      ...parseFonts("700.css", "bold"),
    ],
  });

  registered = true;
}
