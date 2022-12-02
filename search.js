const util = require('util');
const fs = require('fs');

const sb = JSON.parse(fs.readFileSync('./SB3-texts.json'));
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);

const { converter } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.Unicode.index],
  transliterations.flat.index,
);

const translite = converter(replacer);

// eslint-disable-next-line func-names
const idx = lunr(function () {
  this.field('sanskrit', {
    extractor: (obj) => translite(obj.sanskrit.join('\n')),
  });
  this.field('translation', { extractor: (obj) => translite(obj.translation) });
  this.field('wbw', {
    extractor: (obj) => translite(obj.wbw.map((w) => w.join(' - ')).join('\n')),
  });
  this.field('footnote', {
    extractor: (obj) => (obj.footnote ? translite(obj.footnote.join('\n')) : null),
  });
  this.field('purport', {
    extractor: (obj) => (obj.purport ? translite(obj.purport.join('\n')) : null),
  });

  sb.forEach((text) => {
    this.use(lunr.ru);
    this.add({
      ...text,
    });
  });
});

console.log(util.inspect(idx.search('свами'), { depth: 10 }));

fs.writeFileSync('SB3-index.json', JSON.stringify(idx));
