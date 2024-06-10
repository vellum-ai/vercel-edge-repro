declare module "@joplin/turndown-plugin-gfm" {
  import type TurndownService from "turndown";
  export default class TurndownPluginGFM {
    constructor();
    static gfm: TurndownService.Plugin;
  }
}
