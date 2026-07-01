import { resolve } from "path";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: resolve(process.cwd(), ".env") });

type ProductDiscount = {
  type: string;
  value: number;
};

type LegacyProductDocument = {
  _id: unknown;
  discount?: ProductDiscount | null;
  fabrics?: Array<{
    colors?: Array<{
      discount?: ProductDiscount | null;
    }>;
  }>;
};

function getRequiredEnv(name: "MONGODB_URI" | "MONGODB_DATABASE"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function migrateProductDiscountToColors(): Promise<void> {
  const uri = getRequiredEnv("MONGODB_URI");
  const databaseName = getRequiredEnv("MONGODB_DATABASE");
  const client = new MongoClient(uri);

  await client.connect();
  const collection = client
    .db(databaseName)
    .collection<LegacyProductDocument>("products");

  const cursor = collection.find({
    discount: { $exists: true, $ne: null },
  });

  let scanned = 0;
  let updated = 0;

  for await (const product of cursor) {
    scanned += 1;
    const legacyDiscount = product.discount;
    if (!legacyDiscount || legacyDiscount.value <= 0) {
      await collection.updateOne(
        { _id: product._id },
        { $unset: { discount: "" } },
      );
      updated += 1;
      continue;
    }

    const fabrics = product.fabrics ?? [];
    let touchedColor = false;

    const nextFabrics = fabrics.map((fabric) => ({
      ...fabric,
      colors: (fabric.colors ?? []).map((color) => {
        if (color.discount && color.discount.value > 0) {
          return color;
        }

        touchedColor = true;
        return {
          ...color,
          discount: legacyDiscount,
        };
      }),
    }));

    await collection.updateOne(
      { _id: product._id },
      touchedColor
        ? {
            $set: { fabrics: nextFabrics },
            $unset: { discount: "" },
          }
        : {
            $unset: { discount: "" },
          },
    );
    updated += 1;
  }

  console.log(
    `Product discount migration complete. Scanned ${scanned} product(s), updated ${updated} product(s).`,
  );

  await client.close();
}

void migrateProductDiscountToColors().catch((error: unknown) => {
  console.error("Product discount migration failed.", error);
  process.exitCode = 1;
});
