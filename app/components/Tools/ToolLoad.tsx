import { AspectRatio, Card, CardContent, Skeleton, useTheme } from "@mui/joy";

export default function ToolLoad() {
  const theme = useTheme();
  return (
    <Card
      variant="soft"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        width: "100%",
        height: "100%",
        overflow: "hidden",
        maxWidth: "880px",
      }}
    >
      <CardContent
        sx={{
          padding: theme.spacing(2),
          backgroundColor: "#E9ECF1",
        }}
      >
        <Skeleton
          animation="wave"
          variant="text"
          sx={{
            width: "80%",
            marginBottom: "16px",
          }}
        />
        <Skeleton
          animation="wave"
          variant="text"
          level="body-sm"
          sx={{ width: "100%", marginBottom: "16px" }}
        />
        <AspectRatio
          maxHeight="120px"
          sx={{ width: "100%", marginBottom: "16px" }}
        >
          <Skeleton animation="wave" variant="overlay" />
        </AspectRatio>
        <AspectRatio
          ratio="21/9"
          maxHeight="120px"
          sx={{ width: "100%", marginBottom: "16px" }}
        >
          <Skeleton animation="wave" variant="overlay" />
        </AspectRatio>
        <AspectRatio
          ratio="21/9"
          maxHeight="120px"
          sx={{ width: "100%", marginBottom: "16px" }}
        >
          <Skeleton animation="wave" variant="overlay" />
        </AspectRatio>
      </CardContent>
    </Card>
  );
}
