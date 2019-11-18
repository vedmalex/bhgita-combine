const { inspect } = require('util');
var fs = require('fs');
var sb = JSON.parse(fs.readFileSync('./SB3-texts.json'));
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);

var idx = lunr(function() {
  this.field('sanskrit');
  this.field('translation');
  this.field('purport');

  sb.forEach(text => {
    this.use(lunr.ru);
    this.add({
      id: `3.${text.chapter}.${text.name}`,
      translation: text.translation,
      purport: text.purport ? text.purport.join('\n') : '',
    });
  });
});

console.log(inspect(idx.search('свами'), { depth: 10 }));

fs.writeFileSync('SB3-index.json', JSON.stringify(idx));
