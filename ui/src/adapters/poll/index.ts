import type { UIAdapterModule } from "../types";
import { parsePollStdoutLine } from "./parse-stdout";
import { PollConfigFields } from "./config-fields";
import { buildPollConfig } from "./build-config";

export const pollUIAdapter: UIAdapterModule = {
  type: "poll",
  label: "Poll (API-driven)",
  parseStdoutLine: parsePollStdoutLine,
  ConfigFields: PollConfigFields,
  buildAdapterConfig: buildPollConfig,
};
