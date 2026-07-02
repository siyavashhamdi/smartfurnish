import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { IconButton, Paper, Typography } from "@mui/material";
import { useState, type ReactElement, type ReactNode } from "react";

import { joinClassNames } from "../carousel-track.util";
import styles from "./styles/CatalogSection.module.scss";

type CatalogCollapsibleCardProps = {
  readonly title: string;
  readonly onDelete: () => void;
  readonly defaultExpanded?: boolean;
  readonly compact?: boolean;
  readonly titleTrailing?: ReactNode;
  readonly children: ReactNode;
};

export function CatalogCollapsibleCard({
  title,
  onDelete,
  defaultExpanded = false,
  compact = false,
  titleTrailing,
  children,
}: CatalogCollapsibleCardProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper
      variant="outlined"
      className={compact ? styles.colorCard : styles.card}
    >
      <div className={styles.cardHeader}>
        <button
          type="button"
          className={styles.cardToggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <ExpandMoreRoundedIcon
            fontSize={compact ? "small" : "medium"}
            className={joinClassNames(
              styles.cardToggleCaret,
              expanded && styles.cardToggleCaretExpanded,
            )}
          />
          <span
            className={joinClassNames(
              styles.cardTitleGroup,
              titleTrailing && styles.cardTitleGroupWithTrailing,
            )}
          >
            <Typography
              component="span"
              className={joinClassNames(styles.cardTitle, compact && styles.cardTitleCompact)}
            >
              {title}
            </Typography>
            {titleTrailing ? (
              <>
                <span className={styles.cardTitleSeparator} aria-hidden="true">
                  -
                </span>
                <span className={styles.cardTitleTrailing}>{titleTrailing}</span>
              </>
            ) : null}
          </span>
        </button>
        <IconButton color="error" size={compact ? "small" : "medium"} onClick={onDelete}>
          <DeleteRoundedIcon fontSize={compact ? "small" : "medium"} />
        </IconButton>
      </div>
      <div
        className={joinClassNames(styles.cardCollapse, expanded && styles.cardCollapseExpanded)}
        aria-hidden={!expanded}
      >
        <div className={styles.cardCollapseInner}>
          <div className={styles.cardBody}>{children}</div>
        </div>
      </div>
    </Paper>
  );
}
