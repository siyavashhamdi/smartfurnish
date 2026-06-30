import { gql } from "@apollo/client";

export const PRODUCT_AI_PREVIEW_STAGING_DURATION_QUERY = gql`
  query ProductAiPreviewStagingDuration {
    productAiPreviewStagingDuration {
      durationSeconds
    }
  }
`;
