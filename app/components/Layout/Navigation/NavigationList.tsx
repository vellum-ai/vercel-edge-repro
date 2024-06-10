import {
  AccessTime,
  Home,
  Info,
  Login,
  Logout,
  TextSnippet,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  useTheme,
} from "@mui/joy";
import { useLocation, useNavigate } from "@remix-run/react";
import { useRevalidator } from "@remix-run/react";
import { supabase } from "~/lib/supabase.client";
import { signInWithGoogle } from "~/utils/auth/sign-in";
import { useSession } from "../../../hooks/useSession";

function NavigationListItem({
  route,
  label,
  icon,
  setMobileDrawerOpen,
}: {
  route: string;
  label: string;
  icon: JSX.Element;
  setMobileDrawerOpen: (b: boolean | ((prevVar: boolean) => boolean)) => void;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <ListItem>
      <ListItemButton
        sx={{
          "&:hover": {
            backgroundColor: `${theme.palette["blue-200"]} !important`,
          },
          "&:active": {
            backgroundColor: `${theme.palette["blue-300"]} !important`,
          },
          borderRadius: 4,
          transition: "all 0.1s",
          backgroundColor:
            location.pathname === route
              ? theme.palette["blue-100"]
              : theme.palette.background.body,
        }}
        onClick={() => {
          navigate(route);
          setMobileDrawerOpen(false);
        }}
      >
        <ListItemDecorator>{icon}</ListItemDecorator>
        <ListItemContent>{label}</ListItemContent>
      </ListItemButton>
    </ListItem>
  );
}

export function NavigationList({
  setMobileDrawerOpen,
}: {
  setMobileDrawerOpen: (b: boolean | ((prevVar: boolean) => boolean)) => void;
}) {
  const theme = useTheme();
  const { session } = useSession();
  const revalidator = useRevalidator();
  return (
    <List sx={{ gap: theme.spacing(1.5) }}>
      <NavigationListItem
        route="/"
        label="Home"
        icon={<Home sx={{ fill: theme.palette["blue-500"] }} />}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />
      <NavigationListItem
        route="/my-tools"
        label="My Tools"
        icon={<TextSnippet sx={{ fill: theme.palette["blue-500"] }} />}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />
      <NavigationListItem
        setMobileDrawerOpen={setMobileDrawerOpen}
        icon={<AccessTime sx={{ fill: theme.palette["blue-500"] }} />}
        label="History"
        route="/history"
      />
      <Box sx={{ flexGrow: "1" }} />
      <Divider />
      <NavigationListItem
        route="/about"
        label="About"
        icon={<Info sx={{ fill: theme.palette["blue-500"] }} />}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />
      <ListItem sx={{ borderRadius: "4px" }}>
        {session ? (
          <ListItemButton
            sx={{
              borderRadius: 4,
              "&:hover": {
                backgroundColor: `${theme.palette["blue-200"]} !important`,
              },
              "&:active": {
                backgroundColor: `${theme.palette["blue-300"]} !important`,
              },
            }}
            onClick={async () => {
              supabase.auth.signOut();
              setMobileDrawerOpen(false);
            }}
          >
            <ListItemDecorator
              onClick={() => {
                setMobileDrawerOpen(false);
              }}
            >
              <Logout sx={{ fill: theme.palette["blue-500"] }} />
            </ListItemDecorator>
            <ListItemContent>Log Out</ListItemContent>
          </ListItemButton>
        ) : (
          <ListItemButton
            sx={{
              borderRadius: 4,
              "&:hover": {
                backgroundColor: `${theme.palette["blue-200"]} !important`,
              },
              "&:active": {
                backgroundColor: `${theme.palette["blue-300"]} !important`,
              },
            }}
            onClick={signInWithGoogle}
          >
            <ListItemDecorator>
              <Login sx={{ fill: theme.palette["blue-500"] }} />
            </ListItemDecorator>
            <ListItemContent>Log In</ListItemContent>
          </ListItemButton>
        )}
      </ListItem>
    </List>
  );
}
