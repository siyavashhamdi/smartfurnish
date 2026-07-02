import { FILE_ACCESS_URL_FIELDS } from "./fileAccessUrl.fragment";

export const PRODUCT_DISCOUNT_FIELDS = `
  type
  value
`;

export const PRODUCT_VENDOR_FIELDS = `
  name
  phone
  address
  notes
`;

export const PRODUCT_MATERIAL_PROFILE_FIELDS = `
  texture
  primaryMaterial
  careInstructions
`;

export const PRODUCT_SET_PIECE_DIMENSION_FIELDS = `
  label
  displayText
  widthCm
  heightCm
  depthCm
  sortOrder
`;

export const PRODUCT_FABRIC_COLOR_FIELDS = `
  key
  name
  hexCode
  priceIrt
  discount {
    ${PRODUCT_DISCOUNT_FIELDS}
  }
  sortOrder
  isActive
  aiProductImageAccessUrl {
    ${FILE_ACCESS_URL_FIELDS}
  }
`;

export const PRODUCT_FABRIC_COLOR_USER_FIELDS = `
  key
  name
  hexCode
  priceIrt
  discount {
    ${PRODUCT_DISCOUNT_FIELDS}
  }
  sortOrder
  isActive
  aiProductImageAccessUrl {
    ${FILE_ACCESS_URL_FIELDS}
  }
`;

export const PRODUCT_FABRIC_FIELDS = `
  key
  patternName
  sortOrder
  isActive
  colors {
    ${PRODUCT_FABRIC_COLOR_FIELDS}
  }
`;

export const PRODUCT_FABRIC_USER_FIELDS = `
  key
  patternName
  sortOrder
  isActive
  colors {
    ${PRODUCT_FABRIC_COLOR_USER_FIELDS}
  }
`;

export const PRODUCT_SET_PIECE_FIELDS = `
  key
  name
  description
  sortOrder
  imageAccessUrls {
    ${FILE_ACCESS_URL_FIELDS}
  }
  dimensions {
    ${PRODUCT_SET_PIECE_DIMENSION_FIELDS}
  }
  weightKg
  materialProfile {
    ${PRODUCT_MATERIAL_PROFILE_FIELDS}
  }
`;

export const PRODUCT_LIST_SUMMARY_FIELDS = `
  id
  title
  summary
  coverImageAccessUrls {
    ${FILE_ACCESS_URL_FIELDS}
  }
  priceIrt
  discount {
    ${PRODUCT_DISCOUNT_FIELDS}
  }
  tags
  guaranteePeriodInMonths
`;

export const PRODUCT_ADMIN_LIST_SUMMARY_FIELDS = `
  ${PRODUCT_LIST_SUMMARY_FIELDS}
  isActive
  sortOrder
  reviewStats {
    userCount
    reviewCount
  }
`;

export const PRODUCT_ADMIN_DETAIL_FIELDS = `
  id
  title
  summary
  fullDescription
  coverImageAccessUrls {
    ${FILE_ACCESS_URL_FIELDS}
  }
  priceIrt
  discount {
    ${PRODUCT_DISCOUNT_FIELDS}
  }
  isActive
  isReviewSubmissionEnabled
  isReviewsSectionVisible
  sortOrder
  tags
  guaranteePeriodInMonths
  notes
  vendor {
    ${PRODUCT_VENDOR_FIELDS}
  }
  materialProfile {
    ${PRODUCT_MATERIAL_PROFILE_FIELDS}
  }
  setPieces {
    ${PRODUCT_SET_PIECE_FIELDS}
  }
  fabrics {
    ${PRODUCT_FABRIC_FIELDS}
  }
  createdAt
  updatedAt
`;

export const PRODUCT_USER_DETAIL_FIELDS = `
  id
  title
  summary
  fullDescription
  coverImageAccessUrls {
    ${FILE_ACCESS_URL_FIELDS}
  }
  priceIrt
  discount {
    ${PRODUCT_DISCOUNT_FIELDS}
  }
  tags
  isFree
  isPurchased
  purchaseStatus
  materialProfile {
    ${PRODUCT_MATERIAL_PROFILE_FIELDS}
  }
  setPieces {
    ${PRODUCT_SET_PIECE_FIELDS}
  }
  fabrics {
    ${PRODUCT_FABRIC_USER_FIELDS}
  }
  isReviewSubmissionEnabled
  isReviewsSectionVisible
`;
