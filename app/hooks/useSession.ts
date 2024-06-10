import { useContext } from "react";
import { SessionContext } from "../components/Layout/ApplicationShell";

export const useSession = () => {
  const { session } = useContext(SessionContext);
  const isAuthenticated = session?.user != null;
  return { session, isAuthenticated };
};
