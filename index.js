var crel = require('crel');

module.exports = function(Slide, opts) {
  Slide.prototype.runnable = function(code, codeOpts) {
    return crel(
      'pre',
      { lang: (codeOpts || {}).lang || 'js' },
      crel('code', {}, code)
    );
  };
};
