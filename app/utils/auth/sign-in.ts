import { clientEnvironment } from "~/env/client";
import { supabase } from "~/lib/supabase.client";

async function signInWithGoogleExtension() {
  const manifest = chrome.runtime.getManifest();
  if (!manifest.oauth2?.scopes) {
    console.error("No OAuth2 scopes defined in the manifest");
    return;
  }
  const url = new URL("https://accounts.google.com/o/oauth2/auth");
  url.searchParams.set("client_id", manifest.oauth2.client_id);
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set(
    "redirect_uri",
    `https://${chrome.runtime.id}.chromiumapp.org`,
  );
  url.searchParams.set("scope", manifest.oauth2.scopes.join(" "));

  chrome.identity.launchWebAuthFlow(
    {
      url: url.href,
      interactive: true,
    },
    async (redirectedTo) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (!redirectedTo) {
        console.error("No URL was redirected to");
        return;
      }
      const url = new URL(redirectedTo);
      const params = new URLSearchParams(url.hash.substring(1));
      const idToken = params.get("id_token");

      if (!idToken) {
        console.error("No ID token found in the redirected URL");
        return;
      }

      await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
    },
  );
}

async function signInWithGoogleWeb() {
  const redirectTo = encodeURIComponent(window.location.pathname);
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
    },
  });
}

export const signInWithGoogle =
  clientEnvironment.TARGET === "extension"
    ? signInWithGoogleExtension
    : signInWithGoogleWeb;
