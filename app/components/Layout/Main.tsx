import { Box } from "@mui/joy";
import type { ComponentPropsWithRef, ReactNode } from "react";

type BoxProps = ComponentPropsWithRef<typeof Box>;

type MainProps = BoxProps & {
  children?: ReactNode;
};

/**
 * A wrapper around `<main>` that provides some common styles and layout to be
 * displayed within the router outlet. Most pages should use this component to
 * wrap their content.
 *
 * Providing box props will override most default styles. Some styles may
 * require specifying the `sx` prop to override. If so, you'll need to provide
 * some of the default styles yourself to replace those provided by the `sx`
 * prop.
 *
 * @param props
 * @returns
 */
function Main(props: MainProps): JSX.Element {
  return (
    <Box
      alignContent="flex-start"
      alignItems="stretch"
      component="main"
      display="flex"
      flexWrap="wrap"
      gridAutoColumns="1fr"
      flexGrow={1}
      sx={(theme) => ({
        [theme.breakpoints.only("xs")]: { padding: theme.spacing(2) },
        [theme.breakpoints.only("sm")]: { padding: theme.spacing(3) },
        [theme.breakpoints.only("md")]: { padding: theme.spacing(4) },
        [theme.breakpoints.only("lg")]: { padding: theme.spacing(5) },
        [theme.breakpoints.only("xl")]: { padding: theme.spacing(5) },
        // If this component uses a grid for display, it should display
        // children in columns at or above the medium width breakpoint.
        [theme.breakpoints.up("md")]: {
          gridAutoFlow: "column",
          gridAutoColumns: "1fr 1fr",
          gridAutoRows: "1fr",
        },
        gridAutoFlow: "row",

        backgroundColor: theme.palette["indigo-25"],
        gap: theme.spacing(3),
      })}
      {...props}
    />
  );
}

export default Main;
