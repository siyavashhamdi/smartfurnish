import * as sharpModule from "sharp";

type SharpConstructor = typeof import("sharp");

function resolveSharp(): SharpConstructor {
  const moduleWithDefault = sharpModule as SharpConstructor & {
    default?: SharpConstructor;
  };

  if (typeof moduleWithDefault.default === "function") {
    return moduleWithDefault.default;
  }

  if (typeof moduleWithDefault === "function") {
    return moduleWithDefault as SharpConstructor;
  }

  throw new Error("Failed to load sharp");
}

const sharp = resolveSharp();

export default sharp;
