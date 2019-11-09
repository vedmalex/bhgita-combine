// const mas = 'ś';
// const rep = 'ç';
// const str = 'Çré Räma-navamé';
// cnt = 0;

var converter = require('convert-sanskrit-to-rus').converter;
var verseSize = require('convert-sanskrit-to-rus').verseSize;
var mapper = require('convert-sanskrit-to-rus').mapper;
var transliterations = require('convert-sanskrit-to-rus').transliterations;

var replacer = mapper(
  [transliterations.vedabase.index],
  transliterations.IAST.index
);

var translite = converter(replacer);
var size = verseSize(
  mapper([transliterations.vedabase.index], transliterations.long.index)
);
// console.log(translite('Çré Räma-navamé Çré Räma-navamé Çré Räma-navamé'));
console.log(
  size(`jayati nija-padäbja-prema-dänävatérëo
vividha-madhurimäbdhiù ko ’pi kaiçora-gandhiù
gata-parama-daçäntaà yasya caitanya-rüpäd
anubhava-padam äptaà prema gopéñu nityam`)
);

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
