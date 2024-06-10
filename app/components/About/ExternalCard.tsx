import { Box, Card, Typography, useTheme } from "@mui/joy";
import { Link } from "@remix-run/react";

interface ExternalCardProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}

function ExternalCard({
  title,
  description,
  url,
  imageUrl,
}: ExternalCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 3,
        backgroundColor: "common.white",
        width: "100%",
        position: "relative",
        "&:hover": {
          filter: "brightness(98%)",
        },
        flexGrow: "1",

        [theme.breakpoints.up("md")]: {
          maxWidth: "calc(50% - 24px)",
          flexGrow: "0",
        },
        boxShadow: theme.shadow.sm,
      }}
    >
      <Link to={url} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 150,
            mb: 4,
          }}
        >
          <img src={imageUrl} alt={title} style={{ width: "100%" }} />
        </Box>
        <Typography
          sx={{
            fontFamily: "Nunito",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 700,
            lineHeight: "130%",
            letterSpacing: "0.15px",
            color: theme.palette["gray-700"],
          }}
          textAlign={"center"}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Open Sans",
            fontSize: "15px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "150%",
            letterSpacing: "0.15px",
            color: theme.palette["gray-700"],
          }}
          textAlign={"center"}
        >
          {description}
        </Typography>
      </Link>
    </Card>
  );
}

export default ExternalCard;
