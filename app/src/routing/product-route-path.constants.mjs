/** Shared route constants for app routing and Node build scripts (sitemap). */

export const PRODUCT_ROUTE_ID_PARAM = "productId";

/** Public SPA path for the product catalog and detail pages. */
export const PRODUCTS_ROUTE_PATH = "/products";

/** Former catalog path; used only to redirect old bookmarks to {@link PRODUCTS_ROUTE_PATH}. */
export const LEGACY_PRODUCTS_ROUTE_REDIRECT_PREFIX = "/courses";

/** REST prefix for product payment callbacks (Nest global prefix + controller path). */
export const PRODUCTS_API_ROUTE_PATH = "/api/v1/products";
