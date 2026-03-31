import type { ServerAdapterModule } from "../types.js";
import { execute } from "./execute.js";
import { testEnvironment } from "./test.js";

export const pollAdapter: ServerAdapterModule = {
  type: "poll",
  execute,
  testEnvironment,
  models: [],
  agentConfigurationDoc: `# poll agent configuration

Adapter: poll

This adapter is a no-op. The agent manages its own execution lifecycle
by polling the Paperclip API for assigned issues, checking them out,
executing work independently, and reporting results back via comments
and status updates.

No configuration fields are required.
`,
};
