import type { Message as MessageBase } from "ai";
declare module "*.md" {
  const value: string;
  export default value;
}

declare module "ai" {
  interface Message {
    requestID?: string | null;
    attachedFilePath?: string | null;
    isInternal?: boolean;
  }
}
