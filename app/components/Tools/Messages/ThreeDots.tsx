import { useTheme } from "@mui/joy";
import { ThreeDots } from "react-loader-spinner";

export default function Loader() {
  const theme = useTheme();
  return (
    <ThreeDots
      height="40"
      width="40"
      radius="5"
      color={theme.palette["blue-550"]}
      ariaLabel="three-dots-loading"
      visible={true}
    />
  );
}
