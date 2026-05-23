// Client-safe vars — exposed to the browser via next.config.ts `env: env()`
// Do NOT add secrets (SERVICE_ROLE_KEY, OPENAI_API_KEY, etc.) here.
const envRef = {
    current: {
        SUPABASE_URL: "",
        SUPABASE_ANON_KEY: "",
        AUTH_ENABLED: "false",
    },
};

export const reloadEnv = () => {
    envRef.current = {
        SUPABASE_URL: String(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_ANON_KEY: String(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
        AUTH_ENABLED: process.env.AUTH_ENABLED ?? "false",
    };
};

reloadEnv();

export const env = () => envRef.current;

// Server-only vars — import this ONLY in server components, route handlers, or middleware.
// These values are never included in the client bundle.
export const serverEnv = () => ({
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
});
