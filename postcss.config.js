const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.html", "./src/**/*.svelte"],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

const production = true;
//localhost:5000///!process.env.ROLLUP_WATCH;

http: module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    ...(production ? [purgecss] : [])
  ]
};
