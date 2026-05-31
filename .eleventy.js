module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("admin-contenuti");
  eleventyConfig.addFilter("absoluteUrl", (value, base) => new URL(value || "/", base).href);
  eleventyConfig.addFilter("isoDate", value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  });
  eleventyConfig.addFilter("jsonLd", value => JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029"));

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
