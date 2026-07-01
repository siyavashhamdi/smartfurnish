import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";

import { USER_LIST_QUERY } from "../../graphql/queries/userList.query";
import { useDebounce } from "../../hooks/useDebounce";
import {
  type UserListQuery,
  type UserListQueryVariables,
} from "../../pages/UsersManagement/users-management-list.api";
import {
  ACTIVE_SUPER_ADMIN_DEFAULT_OPTIONS_LIMIT,
  ACTIVE_SUPER_ADMIN_SEARCH_OPTIONS_LIMIT,
  mapActiveSuperAdminListItems,
  type ActiveSuperAdminOption,
} from "./active-super-admin.util";
import { UserRole } from "../../lib/graphql/generated";

type UseActiveSuperAdminSearchOptions = {
  readonly value: ActiveSuperAdminOption | null;
  readonly onChange: (value: ActiveSuperAdminOption | null) => void;
  readonly enabled?: boolean;
};

export function useActiveSuperAdminSearch({
  value,
  onChange,
  enabled = true,
}: UseActiveSuperAdminSearchOptions) {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const variables = useMemo<UserListQueryVariables>(() => {
    const query = debouncedSearch.trim();
    return {
      input: {
        filters: {
          query: query || null,
          role: UserRole.SUPER_ADMIN,
          status: "ACTIVE",
        },
        options: {
          limit: query
            ? ACTIVE_SUPER_ADMIN_SEARCH_OPTIONS_LIMIT
            : ACTIVE_SUPER_ADMIN_DEFAULT_OPTIONS_LIMIT,
          skip: 0,
          sort: { createdAt: "DESC" },
        },
      },
    };
  }, [debouncedSearch]);

  const { data, loading } = useQuery<UserListQuery, UserListQueryVariables>(USER_LIST_QUERY, {
    variables,
    fetchPolicy: "network-only",
    skip: !enabled,
  });

  const options = useMemo(
    () => mapActiveSuperAdminListItems(data?.userList.items ?? []),
    [data],
  );

  const handleInputChange = useCallback(
    (nextValue: string): void => {
      setSearch(nextValue);
      onChange(null);
    },
    [onChange],
  );

  const handleChange = useCallback(
    (nextValue: ActiveSuperAdminOption | null): void => {
      onChange(nextValue);
      if (nextValue) {
        setSearch("");
      }
    },
    [onChange],
  );

  return {
    options,
    loading,
    inputValue: value ? value.label : search,
    onInputChange: handleInputChange,
    onChange: handleChange,
  };
}
