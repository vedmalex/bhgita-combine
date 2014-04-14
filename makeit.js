var dom = require('cheerio');
var fs = require('fs');

var cmp = require('comparator.js');
var diff = cmp.diff;

function cleanCmpResult(src) {
	if ('object' == typeof src) {
		for (var prop in src) {
			if (src[prop] !== undefined && src[prop] !== null) {
				if (src[prop].result === 1) delete src[prop];
				else {
					cleanCmpResult(src[prop]);
					if ('object' == typeof src[prop] && Object.keys(src[prop]).length === 0) delete src[prop];
					if ('object' == typeof src[prop] && Object.keys(src[prop]).length === 1 && 'order' in src[prop]) delete src[prop];

				}
			}
		}
	}
}


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
			case "end" :
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
				if (txts) {
					text = chapter[txts[1]] = {};
					purportPara = 0;
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

var jsb = require('./beautify.js').js_beautify;

function out(json) {
	return jsb(JSON.stringify(json));
}

var chapter = russian_chapter('bg1_ru_v4.html');
var chapter_en_v2 = english_chapter_v2('bg1_en_v2.html');
var chapter_en_v1 = english_chapter_v1('bg1_en_v1.html');


fs.writeFileSync('bg1_ru_v4.js', out(chapter));
fs.writeFileSync('bg1_en_v2.js', out(chapter_en_v2));
fs.writeFileSync('bg1_en_v1.js', out(chapter_en_v1));

// сравнение объектов
// var ch1_diff = diff(chapter_en_v1, chapter_en_v2);
// cleanCmpResult(ch1_diff);
// fs.writeFileSync('bg1_en_v1_vs_v2.js', out(ch1_diff));

console.log('done');
// TODO: сохранить оригинальное форматирование... --- оно есть в текстах.
// заменить <br /> на перенос строки
// <em>...</em> на *...*
// <strong>...</strong>  на *...*
// т.е. имея на руках код можно заменить в исходных файлах санскрит.