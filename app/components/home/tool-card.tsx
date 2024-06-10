import { CalendarTodayOutlined } from "@mui/icons-material";
import { VerifiedUserOutlined } from "@mui/icons-material";
import { Box, Card, CardActions, Link, Typography } from "@mui/joy";
import { useTheme } from "@mui/joy";
import { Link as RemixLink } from "@remix-run/react";
import { LikeButton } from "~/components/tool/like-button";
import { UnlikeButton } from "~/components/tool/unlike-button";
import { useLike } from "~/hooks/use-like";
import { ClientOnly } from "../client-only";
import { ToolIcon } from "./tool-icon";

type ToolCardProps = {
  title: string;
  description: string;
  lastModified: Date;
  isOfficial: boolean;
  isFavorite?: boolean;
  id: number;
};

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  lastModified,
  isOfficial,
  id,
}) => {
  const theme = useTheme();
  const { like, unlike, liked } = useLike({ toolID: id });
  const updatedAtDate = `Edited ${lastModified.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
  return (
    <Card
      sx={(theme) => ({
        backgroundColor: theme.palette.common.white,
        padding: theme.spacing(3),
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        boxShadow: "sm",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette["indigo-50"],
      })}
    >
      <Box display="flex" flexDirection="row" alignItems="start">
        <ToolIcon title={title} />
        <Link overlay component={RemixLink} to={`/tools/${id}`}>
          <Typography
            level="h3"
            sx={(theme) => ({
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(1),
              overflow: "hidden",
              whiteSpace: "wrap",
              width: "100%",
              fontSize: "18px",
              fontFamily: "Nunito",
              fontStyle: "normal",
              fontWeight: "700",
              letterSpacing: " 0.15px",
              display: "-webkit-box",
              textOverflow: "ellipsis",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            })}
          >
            {title}
          </Typography>
        </Link>
        <CardActions sx={{ marginLeft: "auto", padding: 0 }}>
          {liked ? (
            <UnlikeButton onClick={unlike} />
          ) : (
            <LikeButton onClick={like} />
          )}
        </CardActions>
      </Box>
      <Box width="100%" height={"40px"} alignSelf="stretch">
        <Typography
          sx={{
            overflow: "hidden",
            display: "-webkit-box",
            color: theme.palette["gray-600"],
            textOverflow: "ellipsis",
            fontFamily: "Open Sans",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "143%",
            letterSpacing: "0.17px",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box
        className="bottomElement"
        sx={{
          display: "flex",
          marginTop: "auto",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: "4px" }}>
          <ClientOnly>
            <CalendarTodayOutlined
              sx={() => ({
                width: "20px",
                height: "20px",
                color: theme.palette["gray-500"],
              })}
            />
          </ClientOnly>
          <Typography
            sx={{
              color: theme.palette["gray-600"],
              fontFeatureSettings: "'clig' off, 'liga' off",
              fontFamily: "Open Sans",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "20px",
              letterSpacing: "0.14px",
            }}
          >
            {updatedAtDate}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: theme.palette["gray-600"],
            textAlign: "center",
            fontFeatureSettings: "'clig' off, 'liga' off",
            fontFamily: "Open Sans",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "20px",
            letterSpacing: "0.14px",
          }}
        >
          •
        </Typography>
        <Box sx={{ display: "flex", gap: "4px" }}>
          <ClientOnly>
            <VerifiedUserOutlined
              sx={{
                width: "20px",
                height: "20px",
                color: theme.palette["gray-500"],
              }}
            />
          </ClientOnly>
          <Typography
            sx={{
              fontFeatureSettings: "'clig' off, 'liga' off",
              fontFamily: "Open Sans",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "20px",
              letterSpacing: "0.14px",
            }}
          >
            {isOfficial ? "Official" : "Community"}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};
