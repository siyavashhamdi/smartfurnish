import { type ReactElement } from "react";
import { Container } from "@mui/material";

import { useTranslation } from "../../hooks/useTranslation";
import DashboardMenuHeader from "../../shared/DashboardMenuHeader";
import InquiriesList from "./List";

const InquiriesIndex = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" disableGutters>
      <DashboardMenuHeader
        title={t("pages.inquiries.title")}
        description={t("pages.inquiries.subtitle")}
      />
      <InquiriesList />
    </Container>
  );
};

export default InquiriesIndex;
