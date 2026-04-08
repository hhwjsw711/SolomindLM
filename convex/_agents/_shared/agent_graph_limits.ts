/**
 * LangGraph executes a graph as a Pregel loop; each super-step advances an internal step counter.
 * `RunnableConfig.recursionLimit` caps how many more steps may run (LangChain default is 25).
 *
 * We set it explicitly via `compile().withConfig({ recursionLimit })` so studio agents do not rely on
 * a silent upstream default changing across @langchain/core / @langchain/langgraph upgrades.
 */
export const AGENT_LANGGRAPH_RECURSION_LIMIT = 25;
