const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy('assets');

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: '_site',
      include: '_includes'
    }
  };
};
