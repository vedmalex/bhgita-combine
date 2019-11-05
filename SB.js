var dom = require('cheerio');
var path = require('path');
var fs = require('fs');

function russian_chapter(filename) {
  var file = fs.readFileSync(filename).toString();
  var $ = dom.load(file, {
    normalizeWhitespace: true,
    xmlMode: true,
  });
  $('.small-caps').remove();
  var alldivs = $('div');
  var chapter = { texts: [] };
  var index = 0;
  var text;
  var purportPara;

  alldivs.each(function(i, item) {
    var current = $(item).attr('class');
    switch (current) {
      case 'chapter-head':
        var ht = $(item)
          .html()
          .replace(new RegExp(/\<br\s*\/\>/, 'ig'), ' ');
        chapter.name = $('<div>')
          .html(ht)
          .text();
        break;
      case 'chaptno':
        chapter.number = $(item).text();
        break;
      case 'text':
        var txts = $(item)
          .text()
          .match(/ТЕКСТЫ* (\d{1,2})(–(\d{1,2})){0,1}/);

        text = {};
        if (txts[3]) {
          text.text = txts[1] + '-' + txts[3];
        } else {
          text.text = txts[1];
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
          .split(new RegExp(/\<br\s*\/\>/, 'ig'));

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
        text.wbw = {};
        var wbwList = $(item)
          .text()
          .split(';');
        wbwList.forEach(function(item, index) {
          text.wbw[index + 1] = item.split('—').map(function(item) {
            return item.trim();
          });
        });
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
        if (!text.purport) text.purport = {};
        var t = $(item)
          .text()
          .trim();
        if (t) text.purport[++purportPara] = t;
        break;
      case 'end':
        text.end = $(item)
          .text()
          .trim();
        break;
    }
  });
  return chapter;
}

var divs = {};

function examineDiv(filename) {
  var file = fs.readFileSync(filename).toString();
  var $ = dom.load(file, {
    normalizeWhitespace: true,
    xmlMode: true,
  });
  var alldivs = $('div');
  alldivs.each(function(i, item) {
    var current = $(item).attr('class');
    if (current) {
      if (!divs[current]) divs[current] = {};
      divs[current][filename] = 1;
    }
  });
  return divs;
}

var jsb = require('./beautify.js').js_beautify;

function out(json) {
  return jsb(JSON.stringify(json));
}

function readGita(location, reader) {
  var fileList = fs.readdirSync(location);
  var gita = {};
  var file, chapter;
  for (var i = 0, len = fileList.length; i < len; i++) {
    file = path.join(location, fileList[i]);
    if (fs.statSync(file).isFile()) {
      chapter = reader(file);
      gita[chapter.number] = chapter;
    }
  }
  return gita;
}

var gita_ru = readGita('./SB3', russian_chapter);

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
