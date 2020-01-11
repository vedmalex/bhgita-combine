const dom = require('cheerio');
const path = require('path');
const fs = require('fs');

const { converter } = require('convert-sanskrit-to-rus');
const { mapper } = require('convert-sanskrit-to-rus');
const { transliterations } = require('convert-sanskrit-to-rus');

const replacer = mapper(
  [transliterations.Gaura.index],
  transliterations.Unicode.index,
);

const translite = converter(replacer);

function russianChapter(filename) {
  const file = fs.readFileSync(filename).toString();
  const $ = dom.load(file, {
    // normalizeWhitespace: true,
    // xmlMode: true,
  });

  // const { JSDOM } = jsdom;
  // var dom = new JSDOM(file);
  // var $ = jquery(dom.window);

  $('.small-caps').remove();

  const alldivs = $('div');
  const chapter = { texts: [] };
  let index = 0;
  let text;

  alldivs.each((i, item) => {
    const current = $(item).attr('class');
    switch (current) {
      case 'footnote':
        if (!text.footnote) { text.footnote = []; }
        text.footnote.push(translite($(item).text()));
        break;
      case 'chapter-head': {
        const ht = $(item)
          .html()
          .replace(new RegExp(/\n/, 'ig'), ' ');
        chapter.name = translite($('<div>')
          .html(ht)
          .text());
      }
        break;
      case 'chaptno':
        chapter.number = parseInt($(item).text(), 10);
        break;
      case 'header':
        text = { name: translite($(item).text()) };
        chapter.texts.push(text);
        text.index = index;
        index += 1;
        break;

      case 'text': {
        const txts = $(item)
          .text()
          .match(/ТЕКСТЫ* (\d{1,2})(–(\d{1,2})){0,1}/);

        text = {};
        if (txts[3]) {
          text.name = `${txts[1]}-${txts[3]}`;
          text.text = [parseInt(txts[1], 10), parseInt(txts[3], 10)];
        } else {
          text.text = [parseInt(txts[1], 10)];
          const [, name] = txts;
          text.name = name;
        }
        chapter.texts.push(text);
        text.index = index;
        index += 1;
      }
        break;
      // case 'texts':
      //   var txts = $(item)
      //     .text()
      //     .match(/ТЕКСТЫ \d{1,2}\.(\d{1,2})–(\d{1,2})/);
      //   text = chapter[txts[1] + '-' + txts[2]] = {};
      //   break;
      // case 'dev-uvaca':
      // case 'devanagari':
      //   if (!text.devanagari) text.devanagari = [];
      //   text.devanagari.push($(item).text());
      //   break;
      case 'sans-uvaca':
      case 'sanskrit': {
        if (!text.sanskrit) text.sanskrit = [];
        const sansList = $(item)
          .html()
          .split(new RegExp(/\n/, 'ig'));

        text.sanskrit.push(
          ...sansList.map((br) => translite($('<div>')
            .addClass('sanskrit')
            .html(br)
            .text()
            .trim())),
        );
      }
        break;
      case 'word-by-word': {
        const wbwList = $(item)
          .text()
          .split(/[;]/)
          .filter((w) => w);
        text.wbw = wbwList.map((item1) => item1.split('–').map((item2) => translite(item2.trim())));
        const last = text.wbw[text.wbw.length - 1][1];
        if (last.match(/\.$/)) {
          last.slice(0, -1);
          text.wbw[text.wbw.length - 1][1] = last.slice(0, -1);
        }
      }
        break;
      case 'translation':
        text.translation = translite($(item).text());
        break;
      case 'purport':
      case 'purp':
      case 'para':
      case 'keep':
      case 'verse-in-purp':
      case 'verse-small':
      case 'verse-ref': {
        if (!text.purport) text.purport = [];
        let t = translite($(item)
          .text()
          .trim());
        if (t) {
          if (text.purport.length === 0 && t.match(/^КОММЕНТАРИЙ:/)) {
            t = t.slice(13);
          }
          text.purport.push(t);
        }
      }
        break;
      // case 'end':
      //   chapter.end = $(item)
      //     .text()
      //     .trim();
      //   break;
      default: break;
    }
  });
  return chapter;
}

const jsb = require('./beautify.js').js_beautify;

function out(json) {
  return jsb(JSON.stringify(json));
}

function readBook(location, reader) {
  const fileList = fs.readdirSync(location);
  const gita = [];
  let file; let
    chapter;
  for (let i = 0, len = fileList.length; i < len; i += 1) {
    file = path.join(location, fileList[i]);
    if (fs.statSync(file).isFile()) {
      chapter = reader(file);
      gita.push(chapter);
    }
  }
  return gita;
}
console.time('parse');
const giteRu = readBook('./SB3', russianChapter);
console.timeEnd('parse');

fs.writeFileSync('SB3.json', out(giteRu));

console.log('done');
// TODO: сохранить оригинальное форматирование... --- оно есть в текстах.
// заменить <br /> на перенос строки
// <em>...</em> на *...*
// <strong>...</strong>  на *...*
// т.е. имея на руках код можно заменить в исходных файлах санскрит.

// придумать что-то с footnotes!!!

// посмотреть структуру и придумать какую-то связность
//
