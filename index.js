var crel = require('crel');
var fs = require('fs');
var keycode = require('keycode');
var createSandbox = require('browser-module-sandbox');
var insertcss = require('insert-css');

/**
  # shaz-runnable

  A shazam plugin for creating runnable code fragments using
  [`browser-module-sandbox`](https://github.com/maxogden/browser-module-sandbox)

  ## Example Usage

  To be completed.
**/
module.exports = function(Slide, opts) {
  var prelude = (opts || {}).prelude || [
    'var console = require(\'demo-console\');'
  ].join('\n');

  var sandbox;
  var demoContainer = crel('div', { id: 'shazam-democontainer' },
    crel('div', { class: 'loader' })
  );

  function captureKeys(code) {
    return function(evt) {
      switch (keycode(evt)) {
        case 'esc': {
          clearSandbox();
          break;
        }

        case 'enter': {
          runSample(code);
          break;
        }

        default: {
          console.log(keycode(evt));
        }
      }
    };
  }

  function clearSandbox() {
    var iframe = sandbox && sandbox.iframe;
    if (iframe && iframe.iframe && iframe.iframe.parentNode) {
      sandbox.iframe.remove();
    }

    [].slice.call(demoContainer.classList).forEach(function(name) {
      demoContainer.classList.remove(name);
    });
  }

  function runSample(code) {
    clearSandbox();

    sandbox = createSandbox({
      cdn: (opts || {}).cdn,
      container: demoContainer,
      iframeStyle: 'body, html { height: 100%; width: 100%; }',
      iframeHead: '',
      iframeBody: '',
      cacheOpts: {
        inMemory: true
      }
    });

    sandbox
      .on('modules', function(modules) {
      })
      .on('bundleStart', function() {
        demoContainer.classList.add('loading');
      })
      .on('bundleEnd', function(html) {
        demoContainer.classList.remove('loading');
        demoContainer.classList.add('active');
      })
      .on('bundleError', function(err) {
        console.error('bundling error: ', err);
        demoContainer.classList.remove('loading');
      });

    sandbox.bundle(prelude + code);
  }

  Slide.prototype.runnable = function(code, codeOpts) {
    var codeContainer = crel('pre',
      crel(
        'code',
        { class: (codeOpts || {}).lang || 'javascript' },
        code
       ));

    var runLink = crel('a', 'Run');
    var keyHandler = captureKeys(code);

    runLink.addEventListener('click', function() {
      runSample(code);
    });

    this.el.appendChild(crel(
      'div', { class: 'shazam-runnable' },
      codeContainer,
      runLink
    ));

    this.on('activate', function() {
      document.addEventListener('keydown', keyHandler);
    });

    this.on('deactivate', function() {
      clearSandbox();
      document.removeEventListener('keydown', keyHandler);
    });

    return this;
  };

  insertcss((opts || {}).css || fs.readFileSync(__dirname + '/style.css'));
  document.body.appendChild(demoContainer);
};
