const util = require('util');
const fs = require('fs');


const { filter, soundex: sound_ex, stemmer } = require('stemmer-ru');

const sb = JSON.parse(fs.readFileSync('./SB3-texts.json'));

const { Index } = require('flexsearch');
// const { index } = require('cheerio/lib/api/traversing');

const { converter } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.Unicode.index],
  transliterations.flat.index,
);

const translite = converter(replacer);

const rules = [
  [/джн/g, 'гь'],
];

exports.rules = rules;

const soundex = (word) => {
  let result = word.toLowerCase();
  rules.forEach((rule) => {
    result = result.replace(rule[0], rule[1]);
  });
  return result;
};

exports.soundex = soundex;

/*
а и о у ы э е я ё ю

йа йи йо йу йы йэ е я ё ю

джн - гья - гйа
йа - я
йа - ья
йу - ю
йу - ью
с - щ
ш - с
*/

const doc = new Index({
  optimize: true,
  tokenize: 'strict',
  // encode:
  store: true,
  filter,
  stemmer,
});

function addToIndex(item, index) {
  const { id } = item;
  if (item.wbw) {
    item.wbw.forEach((wbw, i) => {
      index.add(`${id}:W:${i}:W`, wbw[0].toLowerCase());
      index.add(`${id}:W:${i}:M`, wbw[1].toLowerCase());
    });
  }
  if (item.sanskrit) {
    item.sanskrit.forEach((s, i) => {
      index.add(`${id}:S:${i}`, s.toLowerCase());
    });
  }
  if (item.translation) {
    index.add(`${id}:T`, item.translation.toLowerCase());
  }
  if (item.purport) {
    item.purport.forEach((pu, i) => {
      index.add(`${id}:P:${i}`, pu.toLowerCase());
    });
  }
}

sb.forEach((item) => {
  addToIndex(item, doc);
});

doc.export((key, data) => {
  fs.writeFileSync(`SB3-fts/${key}.json`, JSON.stringify(data));
});

console.log(translite('сексуальное желание'))
const result = doc.search('сексуальное желание', { enrich: true });
console.log('Results: ', util.inspect(result, { depth: 10 }));
