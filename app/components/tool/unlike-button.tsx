import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton, useTheme } from "@mui/joy";
import { ClientOnly } from "../client-only";

type UnlikeButtonProps = {
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
};

export const UnlikeButton = ({ onClick }: UnlikeButtonProps) => {
  const theme = useTheme();
  return (
    <IconButton
      onClick={onClick}
      aria-label="Remove from favorites"
      sx={{ minHeight: 0, minWidth: 0 }}
    >
      <ClientOnly>
        <FavoriteIcon sx={{ color: theme.palette["blue-500"] }} />
      </ClientOnly>
    </IconButton>
  );
};
UnlikeButton.displayName = "UnlikeButton";
