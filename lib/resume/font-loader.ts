import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerNotoSansJP() {
  if (registered) return;

  const fontsDir = path.join(process.cwd(), "public/fonts");

  Font.register({
    family: "NotoSansJP",
    fonts: [
      {
        src: path.join(fontsDir, "NotoSansJP-Regular.ttf"),
        fontWeight: "normal",
      },
      {
        src: path.join(fontsDir, "NotoSansJP-Bold.ttf"),
        fontWeight: "bold",
      },
    ],
  });

  registered = true;
}
