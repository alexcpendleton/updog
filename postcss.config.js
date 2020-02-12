const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [
    "./src/**/*.html",
    "./src/**/*.svelte",
    "./public/index.html",
    "./public/**/*.css"
  ],

  whitelistPatterns: [/svelte-/, /global/, /flatpickr/],

  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

const production = false; //!process.env.ROLLUP_WATCH;

http: module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    ...(production ? [purgecss] : [])
  ]
};
