const util = require('util');
const fs = require('fs');
const { filter, soundex: sound_ex, stemmer } = require('stemmer-ru');

const sb = JSON.parse(fs.readFileSync('./SB3-texts.json'));
const { Document } = require('flexsearch');
// const { index } = require('cheerio/lib/api/traversing');

const { converter } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.Unicode.index],
  transliterations.flat.index,
);

const transliteIt = converter(replacer);

const translite = (str) => (str ? transliteIt(str) : '');

const doc = new Document({
  document: {
    id: 'id',
    tag: 'chapter',
    store: ['sanskrit[]','wbw[][]', 'translation', 'purport[]'],
    index: [
      { field: 'sanskrit[]'},
      { field: 'wbw[][]' },
      { field: 'translation'  },
      { field: 'purport[]' },
    ],
  },
});


sb.forEach((item) => {
  doc.add(item);
});

doc.export((key, data) => {
  if (data) { fs.writeFileSync(`SB3-fts/${key}.json`, JSON.stringify(data)); }
});

doc.searchAsync('сексуальное').then((result) => {
  console.log('Results: ', util.inspect(result, { depth: 10 }));
});
