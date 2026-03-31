import type {
  AdapterEnvironmentTestResult,
  AdapterEnvironmentTestContext,
} from "../types.js";

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  return {
    adapterType: ctx.adapterType,
    status: "pass",
    checks: [
      {
        code: "poll_no_config_needed",
        level: "info",
        message:
          "Poll adapter requires no configuration. The agent drives its own execution lifecycle via the API.",
      },
    ],
    testedAt: new Date().toISOString(),
  };
}
