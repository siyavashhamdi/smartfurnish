import { resolve } from "path";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: resolve(process.cwd(), ".env") });

type LegacyProductDocument = {
  _id: unknown;
  priceIrt?: number | null;
  fabrics?: Array<{
    colors?: Array<{
      priceIrt?: number | null;
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

async function migrateProductPriceToColors(): Promise<void> {
  const uri = getRequiredEnv("MONGODB_URI");
  const databaseName = getRequiredEnv("MONGODB_DATABASE");
  const client = new MongoClient(uri);

  await client.connect();
  const collection = client
    .db(databaseName)
    .collection<LegacyProductDocument>("products");

  const cursor = collection.find({
    priceIrt: { $type: "number", $gt: 0 },
  });

  let scanned = 0;
  let updated = 0;

  for await (const product of cursor) {
    scanned += 1;
    const legacyPrice = product.priceIrt;
    if (typeof legacyPrice !== "number" || legacyPrice <= 0) {
      continue;
    }

    const fabrics = product.fabrics ?? [];
    let touchedColor = false;

    const nextFabrics = fabrics.map((fabric) => ({
      ...fabric,
      colors: (fabric.colors ?? []).map((color) => {
        if (typeof color.priceIrt === "number" && color.priceIrt > 0) {
          return color;
        }

        touchedColor = true;
        return {
          ...color,
          priceIrt: legacyPrice,
        };
      }),
    }));

    if (!touchedColor) {
      continue;
    }

    await collection.updateOne(
      { _id: product._id },
      {
        $set: { fabrics: nextFabrics },
        $unset: { priceIrt: "" },
      },
    );
    updated += 1;
  }

  console.log(
    `Product price migration complete. Scanned ${scanned} product(s), updated ${updated} product(s).`,
  );

  await client.close();
}

void migrateProductPriceToColors().catch((error: unknown) => {
  console.error("Product price migration failed.", error);
  process.exitCode = 1;
});
