const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);

var converter = require('convert-sanskrit-to-rus').converter;
var mapper = require('convert-sanskrit-to-rus').mapper;
var transliterations = require('convert-sanskrit-to-rus').transliterations;

var replacer = mapper(
  [transliterations.Unicode.index],
  transliterations.flat.index,
);

const indexEntry = {
  id: '3.1.1',
  text: [1],
  name: '1',
  index: 0,
  sanskrit: [
    'ш́рӣ-ш́ука ува̄ча',
    'эвам этат пура̄ пр̣шт̣о',
    'маитрейо бхагава̄н кила',
    'кшаттра̄ ванам̇ правишт̣ена',
    'тйактва̄ сва-гр̣хам р̣ддхимат',
  ],
  wbw: [
    ['ш́рӣ-ш́уках̣ ува̄ча', 'Шри Шукадева Госвами сказал'],
    ['эвам', 'итак'],
    ['этат', 'этот'],
    ['пура̄', 'бывший'],
    ['пр̣шт̣ах̣', 'спросил'],
    ['маитрейах̣', 'великого мудреца Майтрею'],
    ['бхагава̄н', 'Его Милость'],
    ['кила', 'безусловно'],
    ['кшаттра̄', 'Видура'],
    ['ванам', 'лес'],
    ['правишт̣ена', 'придя'],
    ['тйактва̄', 'покинув'],
    ['сва-гр̣хам', 'свой дом'],
    ['р̣ддхимат', 'богатый'],
  ],
  translation:
    'Шукадева Госвами сказал: Покинув свой богатый дом, царь Видура, великий преданный, пришел в лес и обратился к Его Милости Майтрее Риши с такими вопросами.',
  chapter: 1,
};

var translite = converter(replacer);

console.log(translite('этат'));

var idx = lunr(function() {
  this.field('sanskrit', {
    extractor: obj => translite(obj.sanskrit.join('\n')),
  });
  this.field('translation', { extractor: obj => translite(obj.translation) });
  this.field('wbw', {
    extractor: obj => translite(obj.wbw.map(w => w.join(' - ')).join('\n')),
  });
  this.field('footnote', {
    extractor: obj =>
      obj.footnote ? translite(obj.footnote.join('\n')) : null,
  });
  this.field('purport', {
    extractor: obj => (obj.purport ? translite(obj.purport.join('\n')) : null),
  });

  this.use(lunr.ru);
  this.add(indexEntry);
});

console.log(idx.search('этат'));
