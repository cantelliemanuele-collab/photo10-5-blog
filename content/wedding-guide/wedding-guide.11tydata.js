module.exports = {
  layout: "content-article.njk",
  tags: "weddingGuide",
  sectionLabel: "Wedding Guide | Guida al Matrimonio",
  sectionUrl: "/wedding-guide/",
  eleventyComputed: {
    permalink: data => `/wedding-guide/${data.language || "it"}/${data.slug}/index.html`
  }
};
