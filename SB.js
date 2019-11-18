var dom = require('cheerio');
var jsdom = require('jsdom');
var jquery = require('jquery');
var path = require('path');
var fs = require('fs');

var converter = require('convert-sanskrit-to-rus').converter;
var mapper = require('convert-sanskrit-to-rus').mapper;
var transliterations = require('convert-sanskrit-to-rus').transliterations;

var replacer = mapper(
  [transliterations.Gaura.index],
  transliterations.Unicode.index,
);

var translite = converter(replacer);

function russian_chapter(filename) {
  var file = translite(fs.readFileSync(filename).toString());
  var $ = dom.load(file, {
    // normalizeWhitespace: true,
    // xmlMode: true,
  });

  // const { JSDOM } = jsdom;
  // var dom = new JSDOM(file);
  // var $ = jquery(dom.window);

  $('.small-caps').remove();

  var alldivs = $('div');
  var chapter = { texts: [] };
  var index = 0;
  var text;

  alldivs.each(function(i, item) {
    var current = $(item).attr('class');
    switch (current) {
      case 'footnote':
        if (!text.footnote) text.footnote = [];
        text.footnote.push($(item).text());
        break;
      case 'chapter-head':
        var ht = $(item)
          .html()
          .replace(new RegExp(/\n/, 'ig'), ' ');
        chapter.name = $('<div>')
          .html(ht)
          .text();
        break;
      case 'chaptno':
        chapter.number = parseInt($(item).text(), 10);
        break;
      case 'header':
        text = { name: $(item).text() };
        chapter.texts.push(text);
        text.index = index++;
        purportPara = 0;
        break;
      case 'text':
        var txts = $(item)
          .text()
          .match(/ТЕКСТЫ* (\d{1,2})(–(\d{1,2})){0,1}/);

        text = {};
        if (txts[3]) {
          text.name = txts[1] + '-' + txts[3];
          text.text = [parseInt(txts[1], 10), parseInt(txts[3], 10)];
        } else {
          text.text = [parseInt(txts[1], 10)];
          text.name = txts[1];
        }
        chapter.texts.push(text);
        text.index = index++;

        purportPara = 0;
        break;
      // case 'texts':
      //   var txts = $(item)
      //     .text()
      //     .match(/ТЕКСТЫ \d{1,2}\.(\d{1,2})–(\d{1,2})/);
      //   text = chapter[txts[1] + '-' + txts[2]] = {};
      //   purportPara = 0;
      //   break;
      // case 'dev-uvaca':
      // case 'devanagari':
      //   if (!text.devanagari) text.devanagari = [];
      //   text.devanagari.push($(item).text());
      //   break;
      case 'sans-uvaca':
      case 'sanskrit':
        if (!text.sanskrit) text.sanskrit = [];
        var sansList = $(item)
          .html()
          .split(new RegExp(/\n/, 'ig'));

        text.sanskrit.push.apply(
          text.sanskrit,
          sansList.map(function(br) {
            return $('<div>')
              .addClass('sanskrit')
              .html(br)
              .text()
              .trim();
          }),
        );
        break;
      case 'word-by-word':
        var wbwList = $(item)
          .text()
          .split(/[;]/)
          .filter(w => w);
        text.wbw = wbwList.map(item =>
          item.split('–').map(item => item.trim()),
        );
        var last = text.wbw[text.wbw.length - 1][1];
        if (last.match(/\.$/)) {
          last.slice(0, -1);
          text.wbw[text.wbw.length - 1][1] = last.slice(0, -1);
        }
        break;
      case 'translation':
        text.translation = $(item).text();
        break;
      case 'purport':
      case 'purp':
      case 'para':
      case 'keep':
      case 'verse-in-purp':
      case 'verse-small':
      case 'verse-ref':
        if (!text.purport) text.purport = [];
        var t = $(item)
          .text()
          .trim();
        if (t) {
          if (text.purport.length === 0 && t.match(/^КОММЕНТАРИЙ:/)) {
            t = t.slice(13);
          }
          text.purport.push(t);
        }
        break;
      // case 'end':
      //   chapter.end = $(item)
      //     .text()
      //     .trim();
      //   break;
    }
  });
  return chapter;
}

var jsb = require('./beautify.js').js_beautify;

function out(json) {
  return jsb(JSON.stringify(json));
}

function readBook(location, reader) {
  var fileList = fs.readdirSync(location);
  var gita = [];
  var file, chapter;
  for (var i = 0, len = fileList.length; i < len; i++) {
    file = path.join(location, fileList[i]);
    if (fs.statSync(file).isFile()) {
      chapter = reader(file);
      gita.push(chapter);
    }
  }
  return gita;
}
console.time('parse');
var gita_ru = readBook('./SB3', russian_chapter);
console.timeEnd('parse');

fs.writeFileSync('SB3.json', out(gita_ru));

console.log('done');
// TODO: сохранить оригинальное форматирование... --- оно есть в текстах.
// заменить <br /> на перенос строки
// <em>...</em> на *...*
// <strong>...</strong>  на *...*
// т.е. имея на руках код можно заменить в исходных файлах санскрит.

// придумать что-то с footnotes!!!

// посмотреть структуру и придумать какую-то связность
//
