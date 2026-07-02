import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";

import { USER_PRODUCT_INQUIRY_DETAIL_QUERY } from "../../graphql/queries/userProductInquiryDetail.query";
import {
  mapUserProductInquiryDetailRowToRecord,
  type UserProductInquiryDetailQuery,
  type UserProductInquiryDetailQueryVariables,
  type UserProductInquiryDetailRecord,
} from "./inquiry-detail.api";

type UseUserProductInquiryDetailRecordResult = {
  readonly record: UserProductInquiryDetailRecord | null;
  readonly isInitialLoading: boolean;
  readonly reload: () => void;
};

/**
 * Loads a single inquiry for view/history modals. Fires exactly one network request each time
 * inquiryId becomes active (including reopening after close), and ignores parent re-renders.
 */
export function useUserProductInquiryDetailRecord(
  inquiryId: string | null,
): UseUserProductInquiryDetailRecordResult {
  const [record, setRecord] = useState<UserProductInquiryDetailRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [loadInquiryDetail] = useLazyQuery<
    UserProductInquiryDetailQuery,
    UserProductInquiryDetailQueryVariables
  >(USER_PRODUCT_INQUIRY_DETAIL_QUERY, {
    fetchPolicy: "network-only",
  });

  const loadInquiryDetailRef = useRef(loadInquiryDetail);
  useEffect(() => {
    loadInquiryDetailRef.current = loadInquiryDetail;
  }, [loadInquiryDetail]);

  const reload = useCallback((): void => {
    if (!inquiryId) {
      return;
    }

    setReloadNonce((current) => current + 1);
  }, [inquiryId]);

  useEffect(() => {
    if (!inquiryId) {
      setRecord(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const activeInquiryId = inquiryId;

    setRecord(null);
    setLoading(true);

    void loadInquiryDetailRef
      .current({
        variables: { input: { id: activeInquiryId } },
      })
      .then((result) => {
        if (cancelled) {
          return;
        }

        const detail = result.data?.userProductInquiryDetail;
        if (!detail || detail.id !== activeInquiryId) {
          setRecord(null);
          return;
        }

        setRecord(mapUserProductInquiryDetailRowToRecord(detail));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId, reloadNonce]);

  const isInitialLoading = Boolean(inquiryId) && loading && record == null;

  return { record, isInitialLoading, reload };
}
