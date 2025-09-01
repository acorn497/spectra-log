// >  DIR | /config/httpTypes.ts

import colors from "../core/colorManager.js";

const HTTP_MESSAGE_TYPES = {
  100: { httpLabel: "CONTINUE", color: colors.dim },
  101: { httpLabel: "SWITCHING", color: colors.dim },

  200: { httpLabel: "OK", color: colors.green },
  201: { httpLabel: "CREATED", color: colors.green },
  202: { httpLabel: "ACCEPTED", color: colors.cyan },
  204: { httpLabel: "NO-CONTENT", color: colors.gray },

  301: { httpLabel: "MOVED", color: colors.yellow },
  302: { httpLabel: "FOUND", color: colors.yellow },
  304: { httpLabel: "NOT-MODIFIED", color: colors.gray },

  400: { httpLabel: "BAD-REQUEST", color: colors.red },
  401: { httpLabel: "UNAUTHZED", color: colors.red },
  402: { httpLabel: "PAY-REQUEST", color: colors.red },
  403: { httpLabel: "FORBIDDEN", color: colors.red },
  404: { httpLabel: "NOT-FOUND", color: colors.red },
  405: { httpLabel: "NO-METHOD", color: colors.red },
  408: { httpLabel: "TIMEOUT", color: colors.red },
  409: { httpLabel: "CONFLICT", color: colors.red },
  410: { httpLabel: "GONE", color: colors.red },
  429: { httpLabel: "TOO-MANY", color: colors.red },

  500: { httpLabel: "SERVER-ERROR", color: colors.red },
  502: { httpLabel: "BAD-GATEWAY", color: colors.red },
  503: { httpLabel: "SERVER-NAVAL", color: colors.red },
  504: { httpLabel: "GW-TIMEOUT", color: colors.red },

  600: { httpLabel: "SERVER-START", color: colors.yellow },

  default: { httpLabel: "UNKNOWN", color: colors.dim },
};

export default HTTP_MESSAGE_TYPES;
