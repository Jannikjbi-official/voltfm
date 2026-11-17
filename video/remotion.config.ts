// Einstellungen fuer `npx remotion render` und `npx remotion studio`.
// Alles, was hier steht, laesst sich auf der Kommandozeile ueberschreiben.
import { Config } from "@remotion/cli/config";

// Instagram nimmt H.264 + AAC am liebsten an.
Config.setCodec("h264");
// 18 = sehr gute Qualitaet, Datei bleibt trotzdem klein (ca. 5-10 MB).
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
// BT.709 wie bei jedem HD-Video – sonst verschieben manche Apps die Farben leicht.
Config.setColorSpace("bt709");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
