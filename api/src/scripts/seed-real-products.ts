/**
 * Seeds realistic Smart Furnish product catalog entries.
 *
 * Run from api/:
 *   npm run seed:products
 *
 * Re-running removes previous seed products (tags include "seed:auto")
 * before inserting fresh ones.
 */
import { randomUUID } from "crypto";
import { resolve } from "path";
import { config } from "dotenv";
import mongoose from "mongoose";

import { ProductDiscountType } from "../enums";

config({ path: resolve(process.cwd(), ".env") });

const SEED_TAG = "seed:auto";

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
  audience: string;
  promise: string;
  chapters: string[];
};

type SeedProduct = {
  title: string;
  description: string;
  priceIrt: number;
  discount?: {
    type: ProductDiscountType;
    value: number;
  };
  isActive: boolean;
  isReviewSubmissionEnabled: boolean;
  isReviewsSectionVisible: boolean;
  sortOrder: number;
  tags: string[];
  chapters: Array<{
    key: string;
    title: string;
    description: string;
    visibleAfterMinutes?: number;
    isFree: boolean;
    sortOrder: number;
    items: Array<{
      title: string;
      sortOrder: number;
      article: string;
    }>;
  }>;
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
    audience: "خانواده‌هایی که به دنبال مبل راحت، بادوام و هماهنگ با دکور مدرن پذیرایی هستند",
    promise:
      "با مشخصات دقیق ابعاد، رنگ‌ها و پیش‌نمایش AI می‌توانید قبل از خرید ببینید این مبل در فضای واقعی پذیرایی شما چگونه قرار می‌گیرد.",
    chapters: [
      "معرفی مبلمان لینکلن",
      "ابعاد و فضای موردنیاز",
      "پارچه‌ها و رنگ‌های موجود",
      "ساختار داخلی و فوم",
      "راهنمای پیش‌نمایش AI در پذیرایی",
      "پیشنهاد چیدمان با فرش و میز",
      "نحوه سفارش سفارشی",
      "شرایط تحویل و مونتاژ",
      "نگهداری پارچه و تمیزکاری",
      "گارانتی و خدمات پس از فروش",
    ],
  },
  {
    title: "فرش دستبافت طرح شیراز ۳×۲ متر",
    description:
      "فرش دستبافت با طرح کلاسیک شیراز، پشم مرغوب و رنگ‌آمیزی گیاهی — مناسب پذیرایی و اتاق نشیمن.",
    priceIrt: 12_500_000,
    sortOrder: 20,
    tags: ["فرش", "دستباف", "پذیرایی", SEED_TAG],
    audience: "خریدارانی که به دنبال فرش اصیل، بادوام و هماهنگ با مبلمان کلاسیک یا مدرن هستند",
    promise:
      "با راهنمای ابعاد و پیش‌نمایش AI می‌توانید ترکیب فرش با مبلمان و رنگ دیوار را قبل از خرید ببینید.",
    chapters: [
      "معرفی طرح و اصالت فرش",
      "ابعاد و انتخاب سایز مناسب",
      "جنس پشم و رنگ‌آمیزی",
      "نگهداری و تمیزکاری فرش",
      "راهنمای پیش‌نمایش AI در پذیرایی",
      "ترکیب با مبلمان و پرده",
      "شرایط بسته‌بندی و ارسال",
      "گارانتی اصالت و خدمات",
    ],
  },
  {
    title: "کابینت آشپزخانه مدولار مدل مینیمال",
    description:
      "سیستم کابینت مدولار با درب های‌گلاس، یراق‌آلات بلوم و امکان شخصی‌سازی چیدمان بر اساس پلان آشپزخانه.",
    priceIrt: 89_000_000,
    discount: { type: ProductDiscountType.FIXED_AMOUNT_IRT, value: 5_000_000 },
    sortOrder: 30,
    tags: ["آشپزخانه", "کابینت", "مدولار", SEED_TAG],
    audience: "خانواده‌هایی که آشپزخانه خود را بازسازی یا از نو طراحی می‌کنند",
    promise:
      "با بخش‌های فنی و پیش‌نمایش AI می‌توانید چیدمان کابینت، رنگ و جزئیات را در فضای واقعی آشپزخانه ببینید.",
    chapters: [
      "معرفی سیستم مدولار",
      "پلان‌گذاری و اندازه‌گیری",
      "متریال بدنه و رویه",
      "یراق‌آلات و کشوها",
      "رنگ‌ها و ترکیب‌های پیشنهادی",
      "راهنمای پیش‌نمایش AI در آشپزخانه",
      "لوازم جانبی و اکسسوری",
      "فرآیند سفارش و تولید",
      "نصب و تحویل",
      "گارانتی و خدمات پس از فروش",
      "نگهداری و تمیزکاری",
      "پرسش‌های متداول",
    ],
  },
  {
    title: "میز تلویزیون دیواری با نورپردازی LED",
    description:
      "میز TV دیواری با قفسه‌های باز، کابل‌کشی مخفی و نوار LED قابل تنظیم — مناسب پذیرایی و اتاق خانواده.",
    priceIrt: 8_900_000,
    sortOrder: 40,
    tags: ["تلویزیون", "میز TV", "دکور", SEED_TAG],
    audience: "خریدارانی که به دنبال میز تلویزیون مدرن با نورپردازی و مدیریت کابل هستند",
    promise:
      "با مشخصات ابعاد و پیش‌نمایش AI می‌توانید جایگاه میز TV و اثر نور LED را در دیوار پذیرایی ببینید.",
    chapters: [
      "معرفی میز تلویزیون",
      "ابعاد و ظرفیت تلویزیون",
      "متریال و رنگ‌بندی",
      "نورپردازی LED",
      "راهنمای پیش‌نمایش AI در پذیرایی",
      "پیشنهاد چیدمان با مبل و فرش",
      "نصب دیواری و ایمنی",
      "نگهداری و تمیزکاری",
      "گارانتی",
    ],
  },
  {
    title: "نمای دیوار سه‌بعدی مدل آرام",
    description:
      "پنل دیواری سه‌بعدی با بافت چوب طبیعی و رنگ‌های مات — برای accent wall در پذیرایی، اتاق خواب یا راهرو.",
    priceIrt: 6_500_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 10 },
    sortOrder: 50,
    tags: ["نمای دیوار", "دکور", "پنل دیواری", SEED_TAG],
    audience: "کسانی که می‌خواهند یک دیوار برجسته و متمایز در فضای داخلی ایجاد کنند",
    promise:
      "با پیش‌نمایش AI می‌توانید ببینید پنل دیواری در فضای واقعی منزل شما چه اثری ایجاد می‌کند.",
    chapters: [
      "معرفی پنل دیواری آرام",
      "ابعاد و پوشش متراژ",
      "بافت و رنگ‌های موجود",
      "راهنمای پیش‌نمایش AI",
      "پیشنهاد دیوار accent",
      "نصب و چسباندن",
      "نگهداری",
      "گارانتی",
    ],
  },
  {
    title: "ست میز و صندلی ناهارخوری ۶ نفره",
    description:
      "ست ناهارخوری شش‌نفره با میز چوب راش و صندلی‌های راحت با روکش پارچه‌ای — مناسب آشپزخانه باز و فضای ناهارخوری.",
    priceIrt: 32_000_000,
    sortOrder: 60,
    tags: ["مبلمان", "ناهارخوری", "ست", SEED_TAG],
    audience: "خانواده‌هایی که فضای ناهارخوری گرم و کاربردی برای ۴ تا ۶ نفر می‌خواهند",
    promise:
      "با راهنمای ابعاد و پیش‌نمایش AI می‌توانید چیدمان ست ناهارخوری را در فضای واقعی ببینید.",
    chapters: [
      "معرفی ست ناهارخوری",
      "ابعاد میز و صندلی‌ها",
      "متریال چوب و پارچه",
      "رنگ‌ها و ترکیب‌های پیشنهادی",
      "راهنمای پیش‌نمایش AI",
      "فاصله‌گذاری در فضا",
      "تحویل و مونتاژ",
      "نگهداری چوب و پارچه",
      "گارانتی",
    ],
  },
  {
    title: "تخت خواب دوبل با کشو مدل رویال",
    description:
      "تخت خواب دو نفره با headboard پارچه‌ای، ۴ کشوی ذخیره‌سازی و فریم فلزی مقاوم — مناسب اتاق خواب اصلی.",
    priceIrt: 28_500_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 12 },
    sortOrder: 70,
    tags: ["مبلمان", "خواب", "تخت", SEED_TAG],
    audience: "زوج‌هایی که به دنبال تخت خواب کاربردی با فضای ذخیره‌سازی اضافی هستند",
    promise:
      "با مشخصات ابعاد و پیش‌نمایش AI می‌توانید جایگاه تخت و headboard را در اتاق خواب واقعی ببینید.",
    chapters: [
      "معرفی تخت رویال",
      "ابعاد و سایز تشک",
      "headboard و پارچه",
      "کشوهای ذخیره‌سازی",
      "رنگ‌ها و ترکیب‌ها",
      "راهنمای پیش‌نمایش AI در اتاق خواب",
      "هماهنگی با کمد و پاتختی",
      "تحویل و مونتاژ",
      "نگهداری",
      "گارانتی",
    ],
  },
  {
    title: "کمد دیواری ۳ درب با آینه",
    description:
      "کمد دیواری سه‌درب با آینه تمام‌قد، یراق‌آلات آرام‌بند و قفسه‌بندی داخلی قابل تنظیم.",
    priceIrt: 24_000_000,
    sortOrder: 80,
    tags: ["مبلمان", "خواب", "کمد", SEED_TAG],
    audience: "خریدارانی که به فضای ذخیره‌سازی منظم و آینه تمام‌قد در اتاق خواب نیاز دارند",
    promise:
      "با راهنمای ابعاد و پیش‌نمایش AI می‌توانید جایگاه کمد دیواری را در اتاق خواب ببینید.",
    chapters: [
      "معرفی کمد دیواری",
      "ابعاد و عمق",
      "چیدمان داخلی",
      "آینه و درب‌ها",
      "رنگ‌ها و متریال",
      "راهنمای پیش‌نمایش AI",
      "نصب دیواری",
      "نگهداری",
      "گارانتی",
    ],
  },
  {
    title: "میز کار خانگی مدل اسکاندیناوی",
    description:
      "میز تحریر و کار خانگی با طراحی مینیمال، کشوی مخفی و پایه‌های چوبی — مناسب اتاق کار و گوشه مطالعه.",
    priceIrt: 9_800_000,
    sortOrder: 90,
    tags: ["مبلمان", "دفتر", "میز کار", SEED_TAG],
    audience: "افرادی که فضای کار یا مطالعه جمع‌وجور و هماهنگ با دکور منزل می‌خواهند",
    promise:
      "با پیش‌نمایش AI می‌توانید میز کار را در گوشه واقعی اتاق یا پذیرایی ببینید.",
    chapters: [
      "معرفی میز اسکاندیناوی",
      "ابعاد و فضای موردنیاز",
      "متریال و رنگ",
      "کشو و مدیریت کابل",
      "راهنمای پیش‌نمایش AI",
      "ترکیب با صندلی و قفسه",
      "تحویل",
      "نگهداری چوب",
      "گارانتی",
    ],
  },
  {
    title: "آینه دکوراتیو با قاب چوبی",
    description:
      "آینه دکوراتیو گرد با قاب چوب طبیعی و بافت دست‌ساز — مناسب راهرو، پذیرایی و اتاق خواب.",
    priceIrt: 3_200_000,
    discount: { type: ProductDiscountType.PERCENTAGE, value: 8 },
    sortOrder: 100,
    tags: ["دکور", "آینه", SEED_TAG],
    audience: "کسانی که به دنبال المان دکوراتیو ظریف برای تکمیل فضای داخلی هستند",
    promise:
      "با پیش‌نمایش AI می‌توانید جایگاه آینه و بازتاب نور آن را در دیوار واقعی ببینید.",
    chapters: [
      "معرفی آینه دکوراتیو",
      "ابعاد و قطر",
      "قاب چوبی و بافت",
      "راهنمای پیش‌نمایش AI",
      "پیشنهاد جایگاه نصب",
      "نصب ایمن",
      "نگهداری",
    ],
  },
  {
    title: "ست آباژور و میز کنار مبل",
    description:
      "ست دکوراتیو شامل آباژور پارچه‌ای و میز کنار مبل با سطح مرمر مصنوعی — تکمیل‌کننده چیدمان پذیرایی.",
    priceIrt: 4_500_000,
    sortOrder: 110,
    tags: ["دکور", "پذیرایی", "آباژور", SEED_TAG],
    audience: "خریدارانی که جزئیات دکوراتیو پذیرایی را تکمیل می‌کنند",
    promise:
      "با پیش‌نمایش AI می‌توانید ست آباژور و میز کنار مبل را کنار مبلمان واقعی خود ببینید.",
    chapters: [
      "معرفی ست دکوراتیو",
      "ابعاد آباژور و میز",
      "پارچه و متریال",
      "راهنمای پیش‌نمایش AI",
      "پیشنهاد چیدمان",
      "نگهداری",
      "گارانتی",
    ],
  },
  {
    title: "پنل دیواری چوبی مدل طبیعت",
    description:
      "پنل دیواری چوبی با طرح خطوط طبیعت، مناسب accent wall در پذیرایی، دفتر خانگی و فضاهای تجاری کوچک.",
    priceIrt: 5_800_000,
    sortOrder: 120,
    tags: ["نمای دیوار", "دکور", "چوب", SEED_TAG],
    audience: "طراحان و خریدارانی که به دنبال بافت گرم چوب در فضای داخلی هستند",
    promise:
      "با پیش‌نمایش AI می‌توانید پنل چوبی را روی دیوار واقعی فضای خود ببینید.",
    chapters: [
      "معرفی پنل طبیعت",
      "ابعاد و ماژول‌ها",
      "بافت چوب و رنگ",
      "راهنمای پیش‌نمایش AI",
      "پیشنهاد accent wall",
      "نصب",
      "نگهداری چوب",
      "گارانتی",
    ],
  },
];

function getRequiredEnv(name: "MONGODB_URI" | "MONGODB_DATABASE"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Add it to api/.env before seeding.`);
  }

  return value;
}

function buildArticle(
  product: SeedProductDefinition,
  chapterTitle: string,
  itemTitle: string,
  chapterIndex: number,
): string {
  return [
    `## ${itemTitle}`,
    "",
    `${chapterTitle} بخش مهمی از مشخصات «${product.title}» است. ${product.audience} می‌توانند با مطالعه این بخش، جزئیات را قبل از خرید دقیق‌تر بررسی کنند.`,
    "",
    `برای تصمیم‌گیری بهتر، ابعاد فضای خود (اتاق، پذیرایی، آشپزخانه یا ...) را یادداشت کنید و مدل یا رنگ مورد علاقه را انتخاب کنید. سپس از پیش‌نمایش AI استفاده کنید تا ببینید محصول در فضای واقعی منزل شما چگونه دیده می‌شود.`,
    "",
    `در این بخش به ${itemTitle.toLowerCase()} می‌پردازیم: مشخصات فنی، نکات چیدمان، ترکیب رنگی یا راهنمای استفاده — بسته به موضوع بخش.`,
    "",
    `یادآوری: ${product.promise} این بخش شماره ${chapterIndex + 1} از محتوای محصول است؛ برای انتخاب نهایی، چند بخش را با هم مقایسه کنید.`,
  ].join("\n");
}

function buildItems(
  product: SeedProductDefinition,
  chapterTitle: string,
  chapterIndex: number,
) {
  const itemCount = (chapterIndex % 3) + 1;
  const itemTitles = [
    `مشخصات: ${chapterTitle}`,
    `راهنمای عملی ${chapterTitle}`,
    `چک‌لیست ${chapterTitle}`,
  ];

  return itemTitles.slice(0, itemCount).map((itemTitle, itemIndex) => ({
    title: itemTitle,
    sortOrder: itemIndex + 1,
    article: buildArticle(product, chapterTitle, itemTitle, chapterIndex),
  }));
}

function buildProducts(): SeedProduct[] {
  const now = new Date();

  return PRODUCT_DEFINITIONS.map((product) => ({
    title: product.title,
    description: product.description,
    priceIrt: product.priceIrt,
    discount: product.discount,
    isActive: true,
    isReviewSubmissionEnabled: true,
    isReviewsSectionVisible: true,
    sortOrder: product.sortOrder,
    tags: product.tags,
    chapters: product.chapters.map((chapterTitle, chapterIndex) => ({
      key: randomUUID(),
      title: chapterTitle,
      description: `در این بخش از «${product.title}» به ${chapterTitle} می‌پردازیم تا قبل از خرید و پیش‌نمایش AI، اطلاعات لازم را در اختیار داشته باشید.`,
      ...(chapterIndex > 2 && chapterIndex % 4 === 0
        ? { visibleAfterMinutes: chapterIndex * 24 * 60 }
        : {}),
      isFree: chapterIndex < 2,
      sortOrder: chapterIndex + 1,
      items: buildItems(product, chapterTitle, chapterIndex),
    })),
    audit: {
      createdAt: now,
      updatedAt: now,
    },
  }));
}

async function seedRealProducts(): Promise<void> {
  const uri = getRequiredEnv("MONGODB_URI");
  const dbName = getRequiredEnv("MONGODB_DATABASE");

  await mongoose.connect(uri, { dbName });

  const products = buildProducts();
  const productsCollection = mongoose.connection.db.collection("products");

  const existing = await productsCollection.deleteMany({ tags: SEED_TAG });
  const result = await productsCollection.insertMany(products);

  const chapterCount = products.reduce(
    (sum, product) => sum + product.chapters.length,
    0,
  );
  const itemCount = products.reduce(
    (sum, product) =>
      sum +
      product.chapters.reduce(
        (chapterSum, chapter) => chapterSum + chapter.items.length,
        0,
      ),
    0,
  );

  console.log(
    `Seeded ${result.insertedCount} Smart Furnish products (${chapterCount} chapters, ${itemCount} content items).`,
  );
  console.log(
    `Removed ${existing.deletedCount} previous ${SEED_TAG} products.`,
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
