import { Tab as MUITab } from "@mui/joy";
import type { PropsWithChildren } from "react";
export const Tab: React.FC<PropsWithChildren> = ({ children }) => (
  <MUITab
    id="tab"
    sx={{
      fontFamily: "Nunito",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "24px", // 171.429%
      letterSpacing: "0.6px",
      textTransform: "uppercase",
    }}
  >
    {children}
  </MUITab>
);
Tab.displayName = "Tab";
