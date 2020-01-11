// const mas = 'ś';
// const rep = 'ç';
// const str = 'Çré Räma-navamé';
// cnt = 0;

const { converter } = require('convert-sanskrit-to-rus');
const { verseSize } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.Gaura.index],
  transliterations.Unicode.index,
);
const dom = require('cheerio');

const translite = converter(replacer);
// const size = verseSize(
//   mapper([transliterations.vedabase.index], transliterations.long.index),
// );
console.log(translite(`
<div class="sans-uvaca"><i><span class="center-line">сӯта увча</span><br />
са эвам ши-варйо 'йа</i><br />
<span class="hidden">&emsp;&emsp;</span><i>пшо рдж парӣкшит<br />
пратй ха та субаху-вит</i><br />
<span class="hidden">&emsp;&emsp;</span><i>прӣттм рӯйатм ити</i></div>
<div class="word-by-word"><i>сӯта увча</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;Шри Сута Госвами сказал; <i>са</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;он; <i>эвам</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;таким образом; <i>ши-варйа</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;великий <i>риши; айам</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;Шукадева Госвами; <i>пша</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;которого спросил; <i>рдж</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;царь; <i>парӣкшит</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;Махараджа Парикшит; <i>прати</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;ему; <i>ха</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;ответил; <i>там</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;царю; <i>су-баху-вит</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;обладавший обширными познаниями; <i>прӣта-тм</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;полностью удовлетворен; <i>рӯйатм</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;слушай меня; <i>ити</i>&thinsp;&thinsp;&ndash;&thinsp;&thinsp;итак.</div>
`));
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
