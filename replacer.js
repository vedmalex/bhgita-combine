// const mas = 'ś';
// const rep = 'ç';
// const str = 'Çré Räma-navamé';
// cnt = 0;

const { converter } = require('convert-sanskrit-to-rus');
const { verseSize } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.vedabase.index],
  transliterations.IAST.index,
);
const dom = require('cheerio');

const translite = converter(replacer);
// const size = verseSize(
//   mapper([transliterations.vedabase.index], transliterations.long.index),
// );
console.log(translite('satya-pratijïe'));
// console.log(
//   size('satya-pratijïe'),
// );

// res = [str, str.toLowerCase(), str.toUpperCase()]
//   .join(' ')
//   .replace(new RegExp(rep, 'ig'), function(match) {
//     const lower = match.toLowerCase();
//     if (match[0] === lower[0]) {
//       return mas;
//     } else {
//       return mas[0].toUpperCase() + mas.slice(1);
//     }
//   });

// console.log(res);
