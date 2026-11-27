export const PORTAL_TEXT_CONSTANTS = {
  HTTP_402_HEADERS_EXAMPLE: [
    "x-metapay-ref: <bytes32 refId>",
    "x-metapay-tx: <txHash on Meta Earth Chain 400>",
  ],
  EXPIRY_PRESETS: [
    { label: "15 Minutes", seconds: 900 },
    { label: "1 Hour", seconds: 3600 },
    { label: "24 Hours", seconds: 86400 },
    { label: "7 Days", seconds: 604800 },
  ],
} as const;
