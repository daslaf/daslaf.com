module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy('assets');

  return {
    passthroughFileCopye: true,
    dir: {
      input: 'src',
      output: '_site',
      include: '_includes'
    },
  }
};
