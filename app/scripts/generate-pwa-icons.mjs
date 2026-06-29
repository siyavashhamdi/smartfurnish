import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appDir, "..");
const publicDir = path.join(appDir, "public");
const logoSourcePath = path.join(repoRoot, "smart-furnish-logo-aligned.png");
const logoPath = path.join(publicDir, "logo.png");
const iconsDir = path.join(publicDir, "icons");
const androidResDir = path.join(repoRoot, "android/app/src/main/res");

/** White canvas — matches the logo artwork and adaptive-icon background. */
const LAUNCHER_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const MASKABLE_BACKGROUND = { r: 26, g: 46, b: 31, alpha: 1 }; // #1a2e1f forest green
const PNG_OPTIONS = { compressionLevel: 9 };

const ANDROID_LAUNCHER_SIZES = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

/** Adaptive-icon foreground layer sizes (108dp at each density). */
const ANDROID_ADAPTIVE_FOREGROUND_SIZES = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

const ANDROID_NOTIFICATION_SIZES = {
  "drawable-mdpi": 24,
  "drawable-hdpi": 36,
  "drawable-xhdpi": 48,
  "drawable-xxhdpi": 72,
  "drawable-xxxhdpi": 96,
};

const ANDROID_SPLASH_SIZES = {
  "drawable-mdpi": 300,
  "drawable-hdpi": 450,
  "drawable-xhdpi": 600,
  "drawable-xxhdpi": 900,
  "drawable-xxxhdpi": 1200,
};

async function writeSquareIcon(outputPath, size, { maskable = false, launcher = false } = {}) {
  if (!maskable && !launcher) {
    await sharp(logoPath).resize(size, size, { fit: "contain" }).png(PNG_OPTIONS).toFile(outputPath);
    return;
  }

  const iconSize = Math.round(size * (launcher ? 0.72 : 0.8));
  const logo = await sharp(logoPath).resize(iconSize, iconSize, { fit: "contain" }).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: launcher ? LAUNCHER_BACKGROUND : MASKABLE_BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png(PNG_OPTIONS)
    .toFile(outputPath);
}

async function writeAdaptiveForeground(outputPath, size) {
  const iconSize = Math.round(size * 0.72);
  const logo = await sharp(logoPath).resize(iconSize, iconSize, { fit: "contain" }).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: LAUNCHER_BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png(PNG_OPTIONS)
    .toFile(outputPath);
}

async function writeLoginMarketingImage(outputPath) {
  const width = 680;
  const height = 800;
  const logo = await sharp(logoPath)
    .resize(Math.round(width * 0.72), Math.round(width * 0.72), { fit: "contain" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: LAUNCHER_BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png(PNG_OPTIONS)
    .toFile(outputPath);
}

async function writePwaIcons() {
  await mkdir(iconsDir, { recursive: true });

  await Promise.all([
    writeSquareIcon(path.join(iconsDir, "favicon-32.png"), 32),
    writeSquareIcon(path.join(iconsDir, "icon-180.png"), 180),
    writeSquareIcon(path.join(iconsDir, "icon-192.png"), 192),
    writeSquareIcon(path.join(iconsDir, "icon-512.png"), 512),
    writeSquareIcon(path.join(iconsDir, "icon-512-maskable.png"), 512, { maskable: true }),
  ]);
}

async function writeAndroidIcons() {
  await Promise.all([
    ...Object.entries(ANDROID_LAUNCHER_SIZES).flatMap(([folder, size]) => {
      const maskableSize = Math.round(size * (512 / 300));
      const launcherPath = path.join(androidResDir, folder, "ic_launcher.png");
      return [
        mkdir(path.join(androidResDir, folder), { recursive: true }).then(async () => {
          await writeSquareIcon(launcherPath, size, { launcher: true });
          await writeSquareIcon(path.join(androidResDir, folder, "ic_launcher_round.png"), size, {
            launcher: true,
          });
        }),
        writeSquareIcon(path.join(androidResDir, folder, "ic_maskable.png"), maskableSize),
      ];
    }),
    ...Object.entries(ANDROID_ADAPTIVE_FOREGROUND_SIZES).map(([folder, size]) =>
      mkdir(path.join(androidResDir, folder), { recursive: true }).then(() =>
        writeAdaptiveForeground(path.join(androidResDir, folder, "ic_launcher_foreground.png"), size),
      ),
    ),
    ...Object.entries(ANDROID_NOTIFICATION_SIZES).map(([folder, size]) =>
      mkdir(path.join(androidResDir, folder), { recursive: true }).then(() =>
        writeSquareIcon(path.join(androidResDir, folder, "ic_notification_icon.png"), size),
      ),
    ),
    ...Object.entries(ANDROID_SPLASH_SIZES).flatMap(([folder, size]) => {
      const splashTargets = [
        folder,
        folder.replace(/^drawable-/, "drawable-port-"),
        folder.replace(/^drawable-/, "drawable-land-"),
      ];

      return splashTargets.map((targetFolder) =>
        mkdir(path.join(androidResDir, targetFolder), { recursive: true }).then(() =>
          writeSquareIcon(path.join(androidResDir, targetFolder, "splash.png"), size),
        ),
      );
    }),
    mkdir(path.join(androidResDir, "drawable"), { recursive: true }).then(() =>
      writeSquareIcon(path.join(androidResDir, "drawable", "splash.png"), 480),
    ),
    writeSquareIcon(path.join(repoRoot, "android/store_icon.png"), 512),
  ]);
}

await sharp(logoSourcePath).png(PNG_OPTIONS).toFile(logoPath);

await writeLoginMarketingImage(path.join(publicDir, "login-image.png"));
await writePwaIcons();
await writeAndroidIcons();

console.log(
  "Generated logo.png, login-image.png, PWA icons in public/icons/, and Android launcher/notification/splash icons",
);
