/**
 * Seeds realistic Smart Furnish product catalog entries with downloaded images.
 *
 * Run from api/:
 *   npm run seed:products
 *
 * Re-running removes previous seed products (tags include "seed:auto")
 * and their associated stored files before inserting fresh ones.
 */
import { randomUUID } from "crypto";
import { extname } from "path";
import { resolve } from "path";
import { config } from "dotenv";
import { Client as MinioClient } from "minio";
import mongoose, { Types } from "mongoose";

import { ProductDiscountType } from "../enums";

config({ path: resolve(process.cwd(), ".env") });

const SEED_TAG = "seed:auto";

type SeedProgressState = {
  productIndex: number;
  productTotal: number;
  imageIndex: number;
  imageTotal: number;
};

let seedProgress: SeedProgressState = {
  productIndex: 0,
  productTotal: 0,
  imageIndex: 0,
  imageTotal: 0,
};

function logSeedProgress(message: string): void {
  console.log(`[seed:products] ${message}`);
}

type ImageSlot = {
  url: string;
  fileName: string;
};

type SeedSetPieceDefinition = {
  name: string;
  description: string;
  sortOrder: number;
  weightKg?: number;
  imageSlots: ImageSlot[];
  dimensions?: Array<{
    label: string;
    displayText: string;
    widthCm?: number;
    heightCm?: number;
    depthCm?: number;
    sortOrder: number;
  }>;
};

type SeedFabricColorDefinition = {
  name: string;
  hexCode: string;
  sortOrder: number;
  imageSlot: ImageSlot;
};

type SeedFabricDefinition = {
  patternName: string;
  sortOrder: number;
  colors: SeedFabricColorDefinition[];
};

type SeedProductDefinition = {
  title: string;
  description: string;
  priceIrt: number;
  discount?: {
    type: ProductDiscountType;
    value: number;
  };
  sortOrder: number;
  tags: string[];
  vendor: {
    name: string;
    phone: string;
    address: string;
  };
  materialProfile: {
    texture: string;
    primaryMaterial: string;
    secondaryMaterials: string[];
    careInstructions: string;
  };
  coverImageSlots: ImageSlot[];
  setPieces: SeedSetPieceDefinition[];
  fabrics: SeedFabricDefinition[];
};

function countTotalImageSlots(definitions: SeedProductDefinition[]): number {
  return definitions.reduce((total, product) => {
    let count = product.coverImageSlots.length;

    for (const piece of product.setPieces) {
      count += piece.imageSlots.length;
    }

    for (const fabric of product.fabrics) {
      count += fabric.colors.length;
    }

    return total + count;
  }, 0);
}

type StoredFileRecord = {
  _id: Types.ObjectId;
  name: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  bucket: string;
  objectKey: string;
  uploadedAt: Date;
  audit: {
    createdAt: Date;
    updatedAt: Date;
  };
};

const PRODUCT_DEFINITIONS: SeedProductDefinition[] = [
  {
    title: "مبلمان راحتی مدل لینکلن ۳ نفره",
    description:
      "مبل راحتی سه‌نفره با پارچه قابل شست‌وشو، فریم چوب روس و طراحی مدرن مناسب پذیرایی و سالن نشیمن.",
    priceIrt: 48_000_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 15 },
    sortOrder: 10,
    tags: ["مبلمان", "پذیرایی", "راحتی", SEED_TAG],
    vendor: {
      name: "گالری مبلمان آرمان",
      phone: "021-88776655",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۴",
    },
    materialProfile: {
      texture: "مخمل نرم",
      primaryMaterial: "چوب روس",
      secondaryMaterials: ["فوم HR", "پارچه پلی‌استر"],
      careInstructions: "تمیزکاری با جاروبرقی نرم؛ لکه‌گیری با پارچه مرطوب.",
    },
    coverImageSlots: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        fileName: "seed-lincoln-cover-1.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
        fileName: "seed-lincoln-cover-2.jpg",
      },
    ],
    setPieces: [
      {
        name: "مبل سه‌نفره",
        description: "مبل اصلی با پشتی بلند و نشیمن عمیق.",
        sortOrder: 1,
        weightKg: 42,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
            fileName: "seed-lincoln-sofa-1.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
            fileName: "seed-lincoln-sofa-2.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد کلی",
            displayText: "۲۲۰ × ۹۵ × ۸۵ سانتی‌متر",
            widthCm: 220,
            heightCm: 85,
            depthCm: 95,
            sortOrder: 1,
          },
        ],
      },
      {
        name: "پاف همراه",
        description: "پاف مکمل با روکش هم‌طرح مبل.",
        sortOrder: 2,
        weightKg: 8,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
            fileName: "seed-lincoln-ottoman-1.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد پاف",
            displayText: "۶۰ × ۴۵ × ۴۵ سانتی‌متر",
            widthCm: 60,
            heightCm: 45,
            depthCm: 45,
            sortOrder: 1,
          },
        ],
      },
    ],
    fabrics: [
      {
        patternName: "مخمل ریزبافت",
        sortOrder: 1,
        colors: [
          {
            name: "زیتونی",
            hexCode: "#556B2F",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1615529328331-f8917597711f",
              fileName: "seed-lincoln-fabric-velvet-olive.jpg",
            },
          },
          {
            name: "خاکستری دودی",
            hexCode: "#6B6B6B",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
              fileName: "seed-lincoln-fabric-velvet-grey.jpg",
            },
          },
          {
            name: "کرم",
            hexCode: "#F5F0E6",
            sortOrder: 3,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
              fileName: "seed-lincoln-fabric-velvet-cream.jpg",
            },
          },
        ],
      },
      {
        patternName: "کتان بافت‌دار",
        sortOrder: 2,
        colors: [
          {
            name: "سفید طبیعی",
            hexCode: "#F8F6F0",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
              fileName: "seed-lincoln-fabric-linen-white.jpg",
            },
          },
          {
            name: "آبی دریایی",
            hexCode: "#2F6F8F",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
              fileName: "seed-lincoln-fabric-linen-navy.jpg",
            },
          },
        ],
      },
    ],
  },
  {
    title: "ست میز و صندلی ناهارخوری ۶ نفره",
    description:
      "ست ناهارخوری شش‌نفره با میز چوب راش و صندلی‌های راحت با روکش پارچه‌ای — مناسب آشپزخانه باز و فضای ناهارخوری.",
    priceIrt: 32_000_000,
    sortOrder: 20,
    tags: ["مبلمان", "ناهارخوری", "ست", SEED_TAG],
    vendor: {
      name: "مبلمان چوبی راش",
      phone: "021-77889900",
      address: "تهران، میرداماد، خیابان شمس",
    },
    materialProfile: {
      texture: "چوب طبیعی مات",
      primaryMaterial: "چوب راش",
      secondaryMaterials: ["پارچه پلی‌استر", "فوم نشیمن"],
      careInstructions: "گردگیری منظم؛ تمیزکاری پارچه با پارچه مرطوب.",
    },
    coverImageSlots: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        fileName: "seed-dining-cover-1.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
        fileName: "seed-dining-cover-2.jpg",
      },
    ],
    setPieces: [
      {
        name: "میز ناهارخوری",
        description: "میز شش‌نفره با پایه‌های چوبی محکم.",
        sortOrder: 1,
        weightKg: 45,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            fileName: "seed-dining-table-1.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
            fileName: "seed-dining-table-2.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد میز",
            displayText: "۱۸۰ × ۹۰ × ۷۵ سانتی‌متر",
            widthCm: 180,
            heightCm: 75,
            depthCm: 90,
            sortOrder: 1,
          },
        ],
      },
      {
        name: "صندلی ناهارخوری",
        description: "صندلی راحت با پشتی منحنی و روکش پارچه‌ای.",
        sortOrder: 2,
        weightKg: 7,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
            fileName: "seed-dining-chair-1.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد صندلی",
            displayText: "۴۵ × ۹۰ × ۵۵ سانتی‌متر",
            widthCm: 45,
            heightCm: 90,
            depthCm: 55,
            sortOrder: 1,
          },
        ],
      },
    ],
    fabrics: [
      {
        patternName: "پارچه نشیمن صندلی",
        sortOrder: 1,
        colors: [
          {
            name: "خاکستری روشن",
            hexCode: "#B0B0B0",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1615529328331-f8917597711f",
              fileName: "seed-dining-fabric-grey.jpg",
            },
          },
          {
            name: "آبی ملایم",
            hexCode: "#6B8E9F",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
              fileName: "seed-dining-fabric-blue.jpg",
            },
          },
          {
            name: "بژ",
            hexCode: "#D4C4A8",
            sortOrder: 3,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
              fileName: "seed-dining-fabric-beige.jpg",
            },
          },
        ],
      },
    ],
  },
  {
    title: "تخت خواب دوبل با کشو مدل رویال",
    description:
      "تخت خواب دو نفره با headboard پارچه‌ای، ۴ کشوی ذخیره‌سازی و فریم فلزی مقاوم — مناسب اتاق خواب اصلی.",
    priceIrt: 28_500_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 12 },
    sortOrder: 30,
    tags: ["مبلمان", "خواب", "تخت", SEED_TAG],
    vendor: {
      name: "مبلمان خواب رویال",
      phone: "021-66554433",
      address: "تهران، نیاوران، خیابان شهید باهنر",
    },
    materialProfile: {
      texture: "پارچه مخملی",
      primaryMaterial: "فلز گالوانیزه",
      secondaryMaterials: ["MDF", "فوم headboard"],
      careInstructions: "گردگیری headboard؛ کشوها را ماهانه بررسی کنید.",
    },
    coverImageSlots: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
        fileName: "seed-bed-cover-1.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        fileName: "seed-bed-cover-2.jpg",
      },
    ],
    setPieces: [
      {
        name: "تخت خواب دوبل",
        description: "تخت با headboard بلند و ۴ کشوی ذخیره‌سازی.",
        sortOrder: 1,
        weightKg: 65,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
            fileName: "seed-bed-piece-1.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1618220179428-22790b461013",
            fileName: "seed-bed-piece-2.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد تخت",
            displayText: "۱۶۰ × ۲۰۰ سانتی‌متر",
            widthCm: 160,
            depthCm: 200,
            sortOrder: 1,
          },
        ],
      },
      {
        name: "پاتختی جفت",
        description: "دو پاتختی هماهنگ با تخت.",
        sortOrder: 2,
        weightKg: 12,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
            fileName: "seed-bed-nightstand-1.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد پاتختی",
            displayText: "۵۰ × ۵۵ × ۴۰ سانتی‌متر",
            widthCm: 50,
            heightCm: 55,
            depthCm: 40,
            sortOrder: 1,
          },
        ],
      },
    ],
    fabrics: [
      {
        patternName: "روکش headboard",
        sortOrder: 1,
        colors: [
          {
            name: "خاکستری تیره",
            hexCode: "#4A4A4A",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
              fileName: "seed-bed-fabric-dark-grey.jpg",
            },
          },
          {
            name: "کرم روشن",
            hexCode: "#F0E6D8",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
              fileName: "seed-bed-fabric-cream.jpg",
            },
          },
        ],
      },
    ],
  },
  {
    title: "کمد دیواری ۳ درب با آینه",
    description:
      "کمد دیواری سه‌درب با آینه تمام‌قد، یراق‌آلات آرام‌بند و قفسه‌بندی داخلی قابل تنظیم.",
    priceIrt: 24_000_000,
    sortOrder: 40,
    tags: ["مبلمان", "خواب", "کمد", SEED_TAG],
    vendor: {
      name: "مبلمان خواب رویال",
      phone: "021-66554433",
      address: "تهران، نیاوران، خیابان شهید باهنر",
    },
    materialProfile: {
      texture: "ملامینه مات",
      primaryMaterial: "MDF",
      secondaryMaterials: ["آینه سکوریت", "یراق آرام‌بند"],
      careInstructions: "تمیزکاری آینه با شیشه‌شور؛ گردگیری سطح کمد.",
    },
    coverImageSlots: [
      {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
        fileName: "seed-wardrobe-cover-1.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
        fileName: "seed-wardrobe-cover-2.jpg",
      },
    ],
    setPieces: [
      {
        name: "کمد دیواری سه‌درب",
        description: "کمد با آینه تمام‌قد و فضای ذخیره‌سازی گسترده.",
        sortOrder: 1,
        weightKg: 95,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            fileName: "seed-wardrobe-piece-1.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc",
            fileName: "seed-wardrobe-piece-2.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد کمد",
            displayText: "۲۴۰ × ۲۲۰ × ۶۰ سانتی‌متر",
            widthCm: 240,
            heightCm: 220,
            depthCm: 60,
            sortOrder: 1,
          },
        ],
      },
    ],
    fabrics: [
      {
        patternName: "روکش بدنه کمد",
        sortOrder: 1,
        colors: [
          {
            name: "سفید مات",
            hexCode: "#F5F5F5",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
              fileName: "seed-wardrobe-finish-white.jpg",
            },
          },
          {
            name: "گردو",
            hexCode: "#5C4033",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
              fileName: "seed-wardrobe-finish-walnut.jpg",
            },
          },
        ],
      },
    ],
  },
  {
    title: "صندلی راحتی تک‌نفره مدل کلاسیک",
    description:
      "صندلی راحتی تک‌نفره با فریم چوبی، پارچه مخمل و طراحی کلاسیک — مناسب پذیرایی، گوشه مطالعه و کنار پنجره.",
    priceIrt: 14_500_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 10 },
    sortOrder: 50,
    tags: ["مبلمان", "پذیرایی", "صندلی", SEED_TAG],
    vendor: {
      name: "گالری مبلمان آرمان",
      phone: "021-88776655",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۴",
    },
    materialProfile: {
      texture: "مخمل نرم",
      primaryMaterial: "چوب راش",
      secondaryMaterials: ["فوم HR", "پارچه مخمل"],
      careInstructions: "جاروبرقی نرم؛ لکه‌گیری فوری با پارچه خشک.",
    },
    coverImageSlots: [
      {
        url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
        fileName: "seed-armchair-cover-1.jpg",
      },
      {
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
        fileName: "seed-armchair-cover-2.jpg",
      },
    ],
    setPieces: [
      {
        name: "صندلی راحتی",
        description: "صندلی تک‌نفره با دسته‌های چوبی و نشیمن عمیق.",
        sortOrder: 1,
        weightKg: 18,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
            fileName: "seed-armchair-piece-1.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91",
            fileName: "seed-armchair-piece-2.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد صندلی",
            displayText: "۸۵ × ۹۵ × ۸۰ سانتی‌متر",
            widthCm: 85,
            heightCm: 95,
            depthCm: 80,
            sortOrder: 1,
          },
        ],
      },
      {
        name: "پاف کوچک همراه",
        description: "پاف مکمل برای استراحت پا.",
        sortOrder: 2,
        weightKg: 5,
        imageSlots: [
          {
            url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
            fileName: "seed-armchair-ottoman-1.jpg",
          },
        ],
        dimensions: [
          {
            label: "ابعاد پاف",
            displayText: "۵۰ × ۴۰ × ۴۰ سانتی‌متر",
            widthCm: 50,
            heightCm: 40,
            depthCm: 40,
            sortOrder: 1,
          },
        ],
      },
    ],
    fabrics: [
      {
        patternName: "مخمل کلاسیک",
        sortOrder: 1,
        colors: [
          {
            name: "زرشکی",
            hexCode: "#8B1A1A",
            sortOrder: 1,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
              fileName: "seed-armchair-fabric-burgundy.jpg",
            },
          },
          {
            name: "سرمه‌ای",
            hexCode: "#1B2A4A",
            sortOrder: 2,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
              fileName: "seed-armchair-fabric-navy.jpg",
            },
          },
          {
            name: "زیتونی",
            hexCode: "#556B2F",
            sortOrder: 3,
            imageSlot: {
              url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
              fileName: "seed-armchair-fabric-olive.jpg",
            },
          },
        ],
      },
    ],
  },
];

type MinioEnv = {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
};

function getRequiredEnv(name: "MONGODB_URI" | "MONGODB_DATABASE"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Add it to api/.env before seeding.`);
  }

  return value;
}

function getMinioEnv(): MinioEnv {
  const rawEndpoint = process.env.MINIO_ENDPOINT?.replace(
    /^https?:\/\//,
    "",
  )?.split("/")[0];
  const rawPort = parseInt(process.env.MINIO_PORT || "9000", 10);
  const rawUseSSL = process.env.MINIO_USE_SSL === "true";
  const shouldUseConsoleHostMapping =
    rawEndpoint?.startsWith("minio.") && rawPort === 443;

  const endpoint = shouldUseConsoleHostMapping
    ? rawEndpoint!.replace(/^minio\./, "")
    : rawEndpoint;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;

  if (!endpoint || !accessKey || !secretKey || !bucket) {
    throw new Error(
      "MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_BUCKET are required.",
    );
  }

  return {
    endpoint,
    port: shouldUseConsoleHostMapping ? 9000 : rawPort,
    useSSL: shouldUseConsoleHostMapping ? false : rawUseSSL,
    accessKey,
    secretKey,
    bucket,
  };
}

function createMinioClient(minioEnv: MinioEnv): MinioClient {
  return new MinioClient({
    endPoint: minioEnv.endpoint,
    port: minioEnv.port,
    useSSL: minioEnv.useSSL,
    accessKey: minioEnv.accessKey,
    secretKey: minioEnv.secretKey,
  });
}

function resolveExtension(fileName: string, mimeType: string): string {
  const fromName = extname(fileName);
  if (fromName) {
    return fromName;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

function buildObjectKey(
  fileName: string,
  mimeType: string,
  uploadedAt: Date,
): string {
  const extension = resolveExtension(fileName, mimeType);
  const year = uploadedAt.getUTCFullYear();
  const month = String(uploadedAt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(uploadedAt.getUTCDate()).padStart(2, "0");

  return `${year}/${month}/${day}/${randomUUID()}${extension}`;
}

async function downloadImage(url: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SmartFurnishSeedScript/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }

  const mimeType =
    response.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    throw new Error(`Downloaded empty file from ${url}`);
  }

  return { buffer, mimeType };
}

async function ensureBucket(
  minioClient: MinioClient,
  bucket: string,
): Promise<void> {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

async function uploadImageSlot(
  slot: ImageSlot,
  minioClient: MinioClient,
  bucket: string,
  filesCollection: mongoose.mongo.Collection,
  uploadedAt: Date,
  cache: Map<string, Types.ObjectId>,
  contextLabel: string,
): Promise<Types.ObjectId> {
  seedProgress.imageIndex += 1;
  const imageLabel = `[image ${seedProgress.imageIndex}/${seedProgress.imageTotal}]`;

  const cached = cache.get(slot.url);
  if (cached) {
    logSeedProgress(`${imageLabel} ${contextLabel}: reusing ${slot.fileName}`);
    return cached;
  }

  logSeedProgress(
    `${imageLabel} ${contextLabel}: downloading ${slot.fileName}...`,
  );
  const { buffer, mimeType } = await downloadImage(slot.url);
  const objectKey = buildObjectKey(slot.fileName, mimeType, uploadedAt);

  logSeedProgress(
    `${imageLabel} ${contextLabel}: uploading ${slot.fileName} (${buffer.length} bytes)...`,
  );
  await minioClient.putObject(bucket, objectKey, buffer, buffer.length, {
    "Content-Type": mimeType,
    "X-Amz-Meta-Original-Name": encodeURIComponent(slot.fileName),
  });

  const fileId = new Types.ObjectId();
  const storedFile: StoredFileRecord = {
    _id: fileId,
    name: slot.fileName,
    mimeType,
    sizeBytes: buffer.length,
    path: `${bucket}/${objectKey}`,
    bucket,
    objectKey,
    uploadedAt,
    audit: {
      createdAt: uploadedAt,
      updatedAt: uploadedAt,
    },
  };

  await filesCollection.insertOne(storedFile);
  cache.set(slot.url, fileId);
  logSeedProgress(`${imageLabel} ${contextLabel}: stored ${slot.fileName}`);

  return fileId;
}

async function uploadImageSlots(
  slots: ImageSlot[],
  minioClient: MinioClient,
  bucket: string,
  filesCollection: mongoose.mongo.Collection,
  uploadedAt: Date,
  cache: Map<string, Types.ObjectId>,
  contextLabel: string,
): Promise<Types.ObjectId[]> {
  const fileIds: Types.ObjectId[] = [];

  for (const slot of slots) {
    fileIds.push(
      await uploadImageSlot(
        slot,
        minioClient,
        bucket,
        filesCollection,
        uploadedAt,
        cache,
        contextLabel,
      ),
    );
  }

  return fileIds;
}

function collectProductFileIds(product: {
  coverImageFileIds?: Types.ObjectId[];
  setPieces?: Array<{ imageFileIds?: Types.ObjectId[] }>;
  fabrics?: Array<{
    colors?: Array<{ aiProductImageFileId?: Types.ObjectId }>;
  }>;
}): Types.ObjectId[] {
  const fileIds: Types.ObjectId[] = [...(product.coverImageFileIds ?? [])];

  for (const piece of product.setPieces ?? []) {
    fileIds.push(...(piece.imageFileIds ?? []));
  }

  for (const fabric of product.fabrics ?? []) {
    for (const color of fabric.colors ?? []) {
      if (color.aiProductImageFileId) {
        fileIds.push(color.aiProductImageFileId);
      }
    }
  }

  return fileIds;
}

async function deleteStoredFiles(
  fileIds: Types.ObjectId[],
  minioClient: MinioClient,
  filesCollection: mongoose.mongo.Collection,
): Promise<number> {
  if (fileIds.length === 0) {
    return 0;
  }

  const uniqueIds = [...new Set(fileIds.map((id) => id.toString()))].map(
    (id) => new Types.ObjectId(id),
  );

  const files = await filesCollection
    .find({ _id: { $in: uniqueIds } })
    .toArray();

  for (const file of files) {
    try {
      await minioClient.removeObject(file.bucket, file.objectKey);
    } catch {
      // Ignore missing objects during cleanup.
    }
  }

  const result = await filesCollection.deleteMany({ _id: { $in: uniqueIds } });
  return result.deletedCount;
}

async function buildSeedProduct(
  definition: SeedProductDefinition,
  minioClient: MinioClient,
  bucket: string,
  filesCollection: mongoose.mongo.Collection,
  uploadedAt: Date,
  cache: Map<string, Types.ObjectId>,
) {
  seedProgress.productIndex += 1;
  const productLabel = `[product ${seedProgress.productIndex}/${seedProgress.productTotal}]`;
  logSeedProgress(`${productLabel} Building "${definition.title}"...`);

  logSeedProgress(`${productLabel} Uploading cover images...`);
  const coverImageFileIds = await uploadImageSlots(
    definition.coverImageSlots,
    minioClient,
    bucket,
    filesCollection,
    uploadedAt,
    cache,
    `${productLabel} cover`,
  );

  const setPieces = [];

  for (const piece of definition.setPieces) {
    logSeedProgress(
      `${productLabel} Uploading set piece "${piece.name}" images...`,
    );
    const imageFileIds = await uploadImageSlots(
      piece.imageSlots,
      minioClient,
      bucket,
      filesCollection,
      uploadedAt,
      cache,
      `${productLabel} set piece "${piece.name}"`,
    );

    setPieces.push({
      key: randomUUID(),
      name: piece.name,
      description: piece.description,
      sortOrder: piece.sortOrder,
      imageFileIds,
      dimensions: piece.dimensions ?? [],
      weightKg: piece.weightKg,
    });
  }

  const fabrics = [];

  for (const fabric of definition.fabrics) {
    const colors = [];

    for (const color of fabric.colors) {
      logSeedProgress(
        `${productLabel} Uploading fabric "${fabric.patternName}" / "${color.name}" image...`,
      );
      const aiProductImageFileId = await uploadImageSlot(
        color.imageSlot,
        minioClient,
        bucket,
        filesCollection,
        uploadedAt,
        cache,
        `${productLabel} fabric "${fabric.patternName}" / "${color.name}"`,
      );

      colors.push({
        key: randomUUID(),
        name: color.name,
        hexCode: color.hexCode,
        sortOrder: color.sortOrder,
        isActive: true,
        aiProductImageFileId,
      });
    }

    fabrics.push({
      key: randomUUID(),
      patternName: fabric.patternName,
      sortOrder: fabric.sortOrder,
      isActive: true,
      colors,
    });
  }

  logSeedProgress(`${productLabel} Finished "${definition.title}".`);

  return {
    title: definition.title,
    summary: definition.description,
    fullDescription: [
      definition.description,
      "",
      `متریال اصلی: ${definition.materialProfile.primaryMaterial}`,
      `بافت: ${definition.materialProfile.texture}`,
      `نگهداری: ${definition.materialProfile.careInstructions}`,
    ].join("\n"),
    coverImageFileIds,
    priceIrt: definition.priceIrt,
    discount: definition.discount,
    isActive: true,
    isReviewSubmissionEnabled: true,
    isReviewsSectionVisible: true,
    sortOrder: definition.sortOrder,
    tags: definition.tags,
    vendor: definition.vendor,
    materialProfile: definition.materialProfile,
    setPieces,
    fabrics,
    audit: {
      createdAt: uploadedAt,
      updatedAt: uploadedAt,
    },
  };
}

async function seedRealProducts(): Promise<void> {
  logSeedProgress("Starting product seed...");
  const uri = getRequiredEnv("MONGODB_URI");
  const dbName = getRequiredEnv("MONGODB_DATABASE");
  const minioEnv = getMinioEnv();
  const minioClient = createMinioClient(minioEnv);

  seedProgress = {
    productIndex: 0,
    productTotal: PRODUCT_DEFINITIONS.length,
    imageIndex: 0,
    imageTotal: countTotalImageSlots(PRODUCT_DEFINITIONS),
  };

  logSeedProgress(
    `Preparing ${seedProgress.productTotal} products with ${seedProgress.imageTotal} image slots...`,
  );

  logSeedProgress("Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName });
  logSeedProgress(`Connected to database "${dbName}".`);

  logSeedProgress(`Ensuring MinIO bucket "${minioEnv.bucket}" exists...`);
  await ensureBucket(minioClient, minioEnv.bucket);
  logSeedProgress("MinIO bucket is ready.");

  const productsCollection = mongoose.connection.db.collection("products");
  const filesCollection = mongoose.connection.db.collection("files");
  const uploadedAt = new Date();
  const imageCache = new Map<string, Types.ObjectId>();

  logSeedProgress(`Looking for previous ${SEED_TAG} products...`);
  const previousProducts = await productsCollection
    .find({ tags: SEED_TAG })
    .toArray();
  const previousFileIds = previousProducts.flatMap((product) =>
    collectProductFileIds(
      product as Parameters<typeof collectProductFileIds>[0],
    ),
  );
  logSeedProgress(
    `Found ${previousProducts.length} previous products with ${previousFileIds.length} file references.`,
  );

  const products = [];

  for (const definition of PRODUCT_DEFINITIONS) {
    products.push(
      await buildSeedProduct(
        definition,
        minioClient,
        minioEnv.bucket,
        filesCollection,
        uploadedAt,
        imageCache,
      ),
    );
  }

  logSeedProgress("Removing previous seed products from MongoDB...");
  const deletedProducts = await productsCollection.deleteMany({
    tags: SEED_TAG,
  });
  logSeedProgress(
    `Removed ${deletedProducts.deletedCount} previous products. Cleaning up ${previousFileIds.length} stored files...`,
  );
  const deletedFiles = await deleteStoredFiles(
    previousFileIds,
    minioClient,
    filesCollection,
  );
  logSeedProgress(`Removed ${deletedFiles} previous stored files.`);

  logSeedProgress("Inserting new products into MongoDB...");
  const result = await productsCollection.insertMany(products);
  logSeedProgress(`Inserted ${result.insertedCount} products.`);

  const totalImages = imageCache.size;
  const totalFileReferences = products.reduce((count, product) => {
    return count + collectProductFileIds(product).length;
  }, 0);

  logSeedProgress("Seed completed successfully.");
  console.log(`Seeded ${result.insertedCount} Smart Furnish products.`);
  console.log(
    `Removed ${deletedProducts.deletedCount} previous ${SEED_TAG} products.`,
  );
  console.log(`Removed ${deletedFiles} previous seed stored files.`);
  console.log(
    `Uploaded ${totalImages} unique images (${totalFileReferences} total file references across catalog fields).`,
  );
}

seedRealProducts()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to seed products: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
