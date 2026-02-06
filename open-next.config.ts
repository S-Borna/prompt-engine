import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
    ...defineCloudflareConfig({
        enableCacheInterception: true,
    }),
    // Force webpack instead of Turbopack.
    // Turbopack externalizes `pg` as a hashed chunk (e.g. pg-587764f78a6c7a9c)
    // that the Workers runtime cannot resolve at runtime.
    // Webpack bundles it inline, avoiding the "No such module" crash.
    buildCommand: "npx next build --webpack",
};
