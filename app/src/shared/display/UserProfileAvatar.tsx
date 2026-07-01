import { Avatar, type AvatarProps } from "@mui/material";
import { useState, type MouseEvent, type ReactElement } from "react";

import { useCachedFileAccessUrl } from "../../hooks/useCachedFileAccessUrl";
import {
  pickFileAccessUrlDescriptor,
  type FileAccessUrl,
} from "../../utils/fileAccessUrl.util";
import { AvatarInitial } from "./AvatarInitial";
import { FileImageFullscreenDialog } from "./FileImageFullscreenDialog";

type UserProfileAvatarProps = Omit<AvatarProps, "src" | "onClick"> & {
  readonly accessUrl?: FileAccessUrl | null;
  readonly displayName: string;
  readonly initial: string;
  readonly enableFullscreenOnClick?: boolean;
  readonly onClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

export function UserProfileAvatar({
  accessUrl,
  displayName,
  initial,
  enableFullscreenOnClick = true,
  onClick,
  className,
  ...avatarProps
}: UserProfileAvatarProps): ReactElement {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const thumbnailAccessUrl = pickFileAccessUrlDescriptor(accessUrl, "thumbnail");
  const { url: avatarUrl } = useCachedFileAccessUrl(thumbnailAccessUrl, {
    enabled: thumbnailAccessUrl != null,
  });
  const canOpenFullscreen = enableFullscreenOnClick && accessUrl != null;

  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (canOpenFullscreen) {
      event.stopPropagation();
      setIsViewerOpen(true);
    }

    onClick?.(event);
  };

  return (
    <>
      <Avatar
        {...avatarProps}
        className={className}
        src={avatarUrl ?? undefined}
        alt={displayName}
        onClick={canOpenFullscreen || onClick ? handleClick : undefined}
        sx={{
          ...(canOpenFullscreen ? { cursor: "pointer" } : {}),
          ...avatarProps.sx,
        }}
      >
        <AvatarInitial initial={initial} />
      </Avatar>
      {canOpenFullscreen ? (
        <FileImageFullscreenDialog
          open={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          accessUrl={accessUrl}
          title={displayName}
        />
      ) : null}
    </>
  );
}
