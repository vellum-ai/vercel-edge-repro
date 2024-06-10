import { useActionData, useSubmit } from "@remix-run/react";
import { useContext } from "react";
import toast from "react-hot-toast";
import { LikedToolsContext } from "~/context/liked-tools-context";
import { clientEnvironment } from "~/env/client";
import type { action } from "~/routes/api.users.$userID.favorites.$toolID";
import { useSession } from "./useSession";

/**
 * useLike returns functions to like and unlike a tool.
 * It implements optimistic updates, so the UI is
 * not blocked by network latency.
 *
 * @returns An object with `like` and `unlike` functions.
 * @example
 * const { like, unlike } = useLike({ toolID: 1 });
 * like()
 **/

export const useLike = ({ toolID }: { toolID: number }) => {
  const { likedTools, likeTool, unlikeTool } = useContext(LikedToolsContext);
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  const { session } = useSession();
  const userID = session?.user?.id;

  if (actionData?.error) {
    if (likedTools.includes(toolID)) {
      unlikeTool(toolID);
    } else {
      likeTool(toolID);
    }
  }

  if (!userID) {
    return { like: fail, unlike: fail };
  }
  return {
    liked: likedTools.includes(toolID),
    like: () => {
      likeTool(toolID);
      toast.success("Added to Favorites");
      submit(null, {
        navigate: false,
        action: `${clientEnvironment.SITE_URL}/api/users/${userID}/favorites/${toolID}`,
        method: "POST",
      });
    },
    unlike: () => {
      unlikeTool(toolID);
      toast.success("Removed from Favorites");
      submit(null, {
        action: `${clientEnvironment.SITE_URL}/api/users/${userID}/favorites/${toolID}`,
        navigate: false,
        method: "DELETE",
      });
    },
  };
};

const fail = () => {
  toast.error("You must be logged in to favorite a tool");
};
