var dom = require('cheerio');
var path = require('path');
var fs = require('fs');

function russian_chapter(filename) {
	var file = fs.readFileSync(filename).toString();
	var $ = dom.load(file, {
		normalizeWhitespace: true,
		xmlMode: true
	});
	$('.small-caps').remove();
	var alldivs = $('div');
	var chapter = {};
	var text;
	var purportPara;

	alldivs.each(function(i, item) {
		var current = $(item).attr('class');
		switch (current) {
			case 'chapter-head':
				var ht = $(item).html().replace(new RegExp('<br>', 'ig'), " ");
				chapter.name = $('<div>').html(ht).text();
				break;
			case 'chaptno':
				chapter.number = $(item).text();
				break;
			case 'text':
				text = chapter[$(item).text().match(/ТЕКСТ \d{1,2}\.(\d{1,2})/)[1]] = {};
				purportPara = 0;
				break;
			case 'texts':
				var txts = $(item).text().match(/ТЕКСТЫ \d{1,2}\.(\d{1,2})–(\d{1,2})/);
				text = chapter[txts[1] + '-' + txts[2]] = {};
				purportPara = 0;
				break;
			case 'dev-uvaca':
			case 'devanagari':
				if (!text.devanagari) text.devanagari = [];
				text.devanagari.push($(item).text());
				break;
			case 'sans-uvaca':
			case 'sanskrit':
				if (!text.sanskrit) text.sanskrit = [];
				var sansList = $(item).html().split(new RegExp('<br>', 'ig'));

				text.sanskrit.push.apply(text.sanskrit, sansList.map(function(br) {
					return $('<div>').addClass('sanskrit').html(br).text().trim();
				}));
				break;
			case 'word-by-word':
				text.wbw = {};
				var wbwList = $(item).text().split(';');
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
			case 'purp-para':
			case 'keep':
			case 'verse-in-purp':
			case "verse-small":
			case "verse-ref":
				if (!text.purport) text.purport = {};
				var t = $(item).text().trim();
				if (t)
					text.purport[++purportPara] = t;
				break;
			case "end":
				text.end = $(item).text().trim();
				break;
		}
	});
	return chapter;
}

function english_chapter_v2(filename) {
	var file = fs.readFileSync(filename).toString();
	var $ = dom.load(file, {
		normalizeWhitespace: true,
		xmlMode: true
	});

	var alldivs = $('div');
	var chapter = {};
	var text;
	var purportPara;

	alldivs.each(function(i, item) {
		var current = $(item).attr('class');
		switch (current) {
			case 'ch-title':
				var ht = $(item).html().replace(new RegExp('<br>', 'ig'), " ");
				chapter.name = $('<div>').html(ht).text();
				break;
			case 'ch-number':
				chapter.number = $(item).text();
				break;
			case 'text':
				var txts = $(item).text().match(/TEXT (\d{1,2})/);
				purportPara = 0;
				if (txts) {
					text = chapter[txts[1]] = {};
				} else {
					txts = $(item).text().match(/TEXTS (\d{1,2})–(\d{1,2})/);
					text = chapter[txts[1] + '-' + txts[2]] = {};
				}
				break;
			case 'dev-uvaca':
			case 'devanagari':
				if (!text.devanagari) text.devanagari = [];
				var devList = $(item).html().split(new RegExp('<br>', 'ig'));

				text.devanagari.push.apply(text.devanagari, devList.map(function(br) {
					return $('<div>').addClass('devanagari').html(br).text().trim();
				}));
				break;
			case 'sans-uvaca':
			case 'sans':
				if (!text.sanskrit) text.sanskrit = [];
				var sansList = $(item).html().split(new RegExp('<br>', 'ig'));

				text.sanskrit.push.apply(text.sanskrit, sansList.map(function(br) {
					return $('<div>').addClass('sans').html(br).text().trim();
				}));
				break;
			case 'wbw':
				text.wbw = {};
				var wbwList = $(item).text().split(';');
				wbwList.forEach(function(item, index) {
					text.wbw[index + 1] = item.split('–').map(function(item) {
						return item.trim();
					});
				});
				break;
			case 'trans':
				text.translation = $(item).text();
				break;
			case 'para-no-indent':
			case 'para':
			case 'verse-in-purp':
			case 'purp':
			case "verse-ref":
				if (!text.purport) text.purport = {};
				var t = $(item).text();
				if (t)
					text.purport[++purportPara] = t;
				break;
			case 'ch-end':
				text.end = $(item).text().trim();
				break;
		}
	});
	return chapter;
}

function english_chapter_v1(filename) {
	var file = fs.readFileSync(filename).toString();
	var $ = dom.load(file, {
		normalizeWhitespace: true,
		xmlMode: true
	});

	var alldivs = $('div');
	var chapter = {};
	var text;
	var purportPara;
	alldivs.each(function(i, item) {
		var current = $(item).attr('class');
		switch (current) {
			case 'Chapter-Desc':
				var ch = $(item).text().match(/(\d{1,2})\. (.*)/);
				chapter.name = ch[2];
				chapter.number = ch[1];
				break;
			case 'Textnum':
				var txts = $(item).text().match(/TEXT (\d{1,2})/);
				if (txts) {
					text = chapter[txts[1]] = {};
					purportPara = 0;
				} else {
					txts = $(item).text().match(/TEXTS (\d{1,2})-(\d{1,2})/);
					text = chapter[txts[1] + '-' + txts[2]] = {};
				}
				break;
			case 'Uvaca-line':
			case 'Verse-Text':
				if (!text.sanskrit) text.sanskrit = [];
				text.sanskrit.push($(item).text());
				break;
			case 'Synonyms-SA':

				text.wbw = {};
				var wbwList = $(item).text().split(';');
				wbwList.forEach(function(item, index) {
					text.wbw[index + 1] = item.split('-').map(function(item) {
						return item.trim();
					});
				});

				break;
			case 'Translation':
				text.translation = $(item).text();
				break;
			case 'Normal-Level':
				if (!text.purport) text.purport = {};
				var t = $(item).text();
				if (t)
					text.purport[++purportPara] = t;
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
		xmlMode: true
	});
	var alldivs = $('div');
	alldivs.each(function(i, item) {
		var current = $(item).attr('class');
		if (current) {
			if (!divs[current])
				divs[current] = {};
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

var gita_en = readGita('./EN', english_chapter_v2);
var gita_ru = readGita('./RU', russian_chapter);

var gita_en_divs = readGita('./EN', examineDiv);
var gita_ru_divs = readGita('./RU', examineDiv);

for (var ch in gita_ru) {
	for (var vrs in gita_ru[ch]) {
		gita_ru[ch][vrs].devanagari = gita_en[ch][vrs].devanagari;
	}
}

// var chapter = russian_chapter('bg1_ru_v4.html');
// var chapter_en_v2 = english_chapter_v2('bg1_en_v2.html');


// fs.writeFileSync('bg1_ru_v4.js', out(chapter));
fs.writeFileSync('bg_en_v2.js', out(gita_en));
fs.writeFileSync('bg_ru_v4.js', out(gita_ru));

fs.writeFileSync('divs_en_v2.js', out(gita_en_divs));
fs.writeFileSync('divs_ru_v4.js', out(gita_ru_divs));

console.log('done');
// TODO: сохранить оригинальное форматирование... --- оно есть в текстах.
// заменить <br /> на перенос строки
// <em>...</em> на *...*
// <strong>...</strong>  на *...*
// т.е. имея на руках код можно заменить в исходных файлах санскрит.

// придумать что-то с footnotes!!!

// посмотреть структуру и придумать какую-то связность
//