export interface Env {
  FRONTEND_ORIGIN?: string;
  ADAPTION_API_KEY?: string;
  ADAPTION_BASE_URL?: string;
  ADAPTION_MODEL?: string;
  OPENROUTER_BASE_URL?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_API_KEY_1?: string;
  OPENROUTER_API_KEY_2?: string;
  OPENROUTER_API_KEY_3?: string;
  AI_REQUEST_TIMEOUT_MS?: string;
}

export type Bindings = Env;
