import { Menu } from "@mui/icons-material";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/joy";
import { Link, useLocation, useMatch, useNavigate } from "@remix-run/react";
import { useRevalidator } from "@remix-run/react";
import type { Session } from "@supabase/supabase-js";
import { posthog } from "posthog-js";
import {
  type PropsWithChildren,
  Suspense,
  createContext,
  lazy,
  useEffect,
  useRef,
  useState,
} from "react";
import { captureEvent } from "~/utils/metrics";
import LogoSVG from "../../assets/logo.svg";
import { supabase } from "../../lib/supabase.client";
import { createDefaultTool } from "../../utils/api/tools";
import { NavigationList } from "./Navigation/NavigationList";

export const SessionContext = createContext<{ session: Session | null }>({
  session: null,
});
const routeToDisplayName: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/tools": "Tools",
  "/my-tools": "My Tools",
  "/history": "History",
};
const Toaster =
  typeof window !== "undefined"
    ? lazy(() => import("./Toaster.client"))
    : () => null;
export function ApplicationShell(props: PropsWithChildren) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const isOnToolPage = useMatch("/tools/:toolId/*");
  const isOnAboutPage = useMatch("/about");
  const revalidator = useRevalidator();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
      }
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      revalidator.revalidate();
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [revalidator.revalidate]);

  return (
    <SessionContext.Provider value={{ session }}>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100dvh",
          width: "100vw",
          position: "fixed",
        }}
      >
        <Box
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
            flexDirection: "column",
            gap: theme.spacing(1.5),
            padding: theme.spacing(1.5),
            borderColor: theme.palette.neutral.outlinedActiveBg,
            border: "right",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            sx={{
              paddingTop: theme.spacing(1.5),
              paddingBottom: theme.spacing(1.5),
              borderRadius: 4,
            }}
          >
            <Link to="/">
              <img alt="TeachingLab Logo" src={LogoSVG} />
            </Link>
          </Box>
          <Box
            sx={{ display: "flex", height: "100%", flexDirection: "column" }}
          >
            <NavigationList setMobileDrawerOpen={setMobileDrawerOpen} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: {
              xs: "100%",
              sm: "100vw",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              padding: theme.spacing(1.5),
              display: { xs: mobileDrawerOpen ? "block" : "none", sm: "none" },
              position: "fixed",
              top: mobileDrawerOpen ? headerRef.current?.clientHeight : "0px",
              zIndex: "2",
              background: theme.palette.background.body,
            }}
          >
            <NavigationList setMobileDrawerOpen={setMobileDrawerOpen} />
          </Box>
          <Box
            sx={{
              height: "100dvh",
              display: "flex",
              flexDirection: "column",
              overflowY: "scroll",
              background: theme.palette["indigo-25"],
            }}
          >
            <Box
              ref={headerRef}
              sx={{
                backgroundColor: theme.palette.background.body,
                alignItems: "center",
                position: "relative",
                borderBottom: "1px rgba(0, 0, 0, 0.12) solid",
                flexDirection: { xs: "column", sm: "row" },
                paddingY: {
                  xs: theme.spacing(1.5),
                  sm: theme.spacing(2.5),
                },
                paddingX: {
                  xs: theme.spacing(2),
                  sm: theme.spacing(4),
                  lg: theme.spacing(5),
                },
                display: {
                  xs: "flex",
                  sm: isOnToolPage ? "none" : "flex",
                },
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "700",
                  textTransform: "capitalize",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {routeToDisplayName[location.pathname] ?? "TeachingLab.AI"}
              </Typography>
              <Box
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  display: "flex",
                  justifyContent: "space-around",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link to="/">
                    <img alt="TeachingLab Logo" src={LogoSVG} />
                  </Link>

                  <IconButton
                    variant="outlined"
                    sx={{
                      borderColor: theme.palette["blue-500"],
                      paddingX: theme.spacing(1.5),
                      height: "max-content",
                      borderRadius: 4,
                    }}
                    onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  >
                    <Menu
                      sx={{
                        width: 24,
                        height: 24,
                        fill: theme.palette["blue-600"],
                      }}
                    />
                  </IconButton>
                </Box>
                {!isOnAboutPage ? (
                  <Box sx={{ paddingTop: { xs: theme.spacing(2), sm: 0 } }}>
                    <Button
                      id="createnewtool"
                      sx={{
                        backgroundColor: theme.palette["blue-500"],
                        "&:active": {
                          backgroundColor: `${theme.palette["blue-700"]} !important`,
                        },
                        "&:hover": {
                          backgroundColor: `${theme.palette["blue-600"]} !important`,
                        },
                        padding: "4px, 10px, 4px, 10px",
                        borderRadius: "4px",
                        boxShadow: "0px 3px 1px -2px #00000033",
                        height: "30px",
                        textTransform: "uppercase",
                        width: { xs: "100%", sm: "max-content" },
                      }}
                      onClick={async () => {
                        if (!session?.user) {
                          alert("You must be logged in to create a tool.");
                          return;
                        }
                        captureEvent("click-create-new", {});
                        const newTool = await createDefaultTool(
                          session.user.id,
                        );
                        navigate(`/tools/${newTool.id}?editMode=true`);
                      }}
                    >
                      Create New Tool
                    </Button>
                  </Box>
                ) : null}
              </Box>
            </Box>
            {props.children}
          </Box>
        </Box>
      </Box>
    </SessionContext.Provider>
  );
}
