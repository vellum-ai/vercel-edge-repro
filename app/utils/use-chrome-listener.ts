import { useEffect } from "react";
import { clientEnvironment } from "~/env/client";

type Message = {
  action: string;
  elementDetails: {
    html: string;
  };
};
export const useChromeListener =
  clientEnvironment.TARGET === "extension"
    ? (callback: (message: Message) => void) => {
        useEffect(() => {
          chrome.runtime.onMessage.addListener(callback);
          return () => chrome.runtime.onMessage.removeListener(callback);
        }, [callback]);
      }
    : () => {};
