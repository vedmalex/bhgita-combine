const fs = require('fs');

const sb = JSON.parse(fs.readFileSync('./RU.json'));
const jsb = require('../beautify').js_beautify;

function out(json) {
  return jsb(JSON.stringify(json));
}

const texts = sb.reduce((res, cur) => {
  res.push(
    ...cur.texts.map((t) => ({
      id: `${t.name}`,
      ...t,
      chapter: cur.number,
    })),
  );
  return res;
}, []);

const textSearch = sb.reduce((res, cur) => {
  [
    ...cur.texts.map((t) => ({
      id: `${t.name}`,
      ...t,
      chapter: cur.number,
    })),
  ].forEach((t) => { res[t.id] = t; });
  return res;
}, {});

const sizes = sb.reduce((result, current) => {
  result.push(
    ...current.texts.map((t) => {
      let purport;
      let footnote;

      const sanskrit = t.sanskrit.map((s) => s.join('\n'))
        .reduce((_res, cur) => {
          let res = _res;
          res += cur.split(/[-\s]/).length;
          return res;
        }, 0);

      const wbw = t.wbw.reduce((_res, cur) => {
        let res = _res;
        res += cur[0].split(/[-\s]/).length;
        res += cur[1].split(/[-\s]/).length;
        return res;
      }, 0);

      if (t.purport) {
        purport = t.purport.reduce((_res, cur) => {
          let res = _res;
          res += cur.split(/[-\s]/).length;
          return res;
        }, 0);
      }

      const translation = t.translation.split(/[-\s]/).length;

      if (t.footnote) {
        footnote = t.footnote.reduce((_res, cur) => {
          let res = _res;
          res += cur.split(/[-\s]/).length;
          return res;
        }, 0);
      }

      return {
        chapter: current.number,
        text: t.text,
        index: t.index,
        sanskrit,
        wbw,
        translation,
        purport,
        footnote,
        size: sanskrit + wbw + translation + (purport || 0) + (footnote || 0),
      };
    }),
  );
  return result;
}, []);

const chapters = sb.reduce((res, cur) => {
  res.push({ ...cur, texts: undefined, end: undefined });
  return res;
}, []);

fs.writeFileSync('BG-texts.json', out(texts));
fs.writeFileSync('BG-search-results.json', out(textSearch));
fs.writeFileSync('BG-chapters.json', out(chapters));
fs.writeFileSync('BG-sizes.json', out(sizes));
