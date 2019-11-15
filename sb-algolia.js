var path = require('path');
var fs = require('fs');
var sb = JSON.parse(fs.readFileSync('./SB3.json'));
var jsb = require('./beautify.js').js_beautify;

function out(json) {
  return jsb(JSON.stringify(json));
}

var texts = sb.reduce((res, cur) => {
  res.push(...cur.texts.map(t => ({ ...t, chapter: cur.number })));
  return res;
}, []);

var sizes = sb.reduce((res, cur) => {
  res.push(
    ...cur.texts.map(t => {
      var sanskrit;
      var wbw;
      var translation;
      var purport;
      var footnote;

      sanskrit = t.sanskrit.reduce((res, cur) => {
        res += cur.split(/[\-\s]/).length;
        return res;
      }, 0);

      wbw = t.wbw.reduce((res, cur) => {
        res += cur[0].split(/[\-\s]/).length;
        res += cur[1].split(/[\-\s]/).length;
        return res;
      }, 0);

      if (t.purport) {
        purport = t.purport.reduce((res, cur) => {
          res += cur.split(/[\-\s]/).length;
          return res;
        }, 0);
      }

      translation = t.translation.split(/[\-\s]/).length;

      if (t.footnote) {
        footnote = t.footnote.reduce((res, cur) => {
          res += cur.split(/[\-\s]/).length;
          return res;
        }, 0);
      }

      return {
        chapter: cur.number,
        text: t.text,
        index: t.index,
        sanskrit,
        wbw,
        translation,
        purport,
        footnote,
        size: sanskrit + wbw + translation + (purport || 0) + (footnote || 0)
      };
    })
  );
  return res;
}, []);

var chapters = sb.reduce((res, cur) => {
  res.push({ ...cur, texts: undefined, end: undefined });
  return res;
}, []);

fs.writeFileSync('SB3-texts.json', out(texts));
fs.writeFileSync('SB3-chapters.json', out(chapters));
fs.writeFileSync('SB3-sizes.json', out(sizes));
