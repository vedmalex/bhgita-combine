var dom = require('cheerio');
var fs = require('fs');
var path = require('path');

var source_ru = JSON.parse(fs.readFileSync('bg_ru_v4.js').toString());
var source_en = JSON.parse(fs.readFileSync('bg_en_v2.js').toString());


function russian_chapter(filename) {
	var file = fs.readFileSync(filename).toString();
	var $ = dom.load(file, {
		normalizeWhitespace: true,
		xmlMode: false
	});
	$('.dev-uvaca').remove();
	$('.devanagari').remove();
	$('.sans-uvaca').remove();
	$('.sanskrit').remove();
	$('.word-by-word').remove();
	var alldivs = $('div');
	var chaptno;
	var text;

	alldivs.each(function(i, item) {
		var current = $(item).attr('class');
		switch (current) {
			case 'chaptno':
				chaptno = $(item).text();
				break;
			case 'text':
				text = $(item).text().match(/ТЕКСТ \d{1,2}\.(\d{1,2})/)[1];
				break;
			case 'texts':
				var txts = $(item).text().match(/ТЕКСТЫ \d{1,2}\.(\d{1,2})–(\d{1,2})/);
				text = txts[1] + '-' + txts[2];
				break;
			case "translation":
				//соединяем <br />
				var verse_ru = source_ru[chaptno][text];
				var verse_en = source_en[chaptno][text];
				var devanagari = '<div class="devanagari">' + verse_en.devanagari.join('<br/>') + '</div>';
				var sanskrit = '<div class="sanskrit">' + verse_en.sanskrit.join('<br/>') + '</div>';
				var wbw_en = [];
				var wbw_ru = [];
				var wbwt;
				for (wbwt in verse_en.wbw) {
					wbw_en.push(verse_en.wbw[wbwt][0] + ' - ' + verse_en.wbw[wbwt][1]);
				}
				for (wbwt in verse_ru.wbw) {
					wbw_ru.push(verse_ru.wbw[wbwt][0] + ' - ' + verse_ru.wbw[wbwt][1]);
				}
				var wbw = '<div class="word-by-word">' + wbw_en.join('; ') + '</div>';
				wbw += '<div class="word-by-word">' + wbw_ru.join('; ') + '</div>';
				$(item).before(devanagari + sanskrit + wbw);
				break;
		}
	});
	return $.root().html();
}

function readGita(source, dest, reader) {
	var fileList = fs.readdirSync(source);
	var file, content;
	for (var i = 0, len = fileList.length; i < len; i++) {
		file = path.join(source, fileList[i]);
		if (fs.statSync(file).isFile()) {
			content = reader(file);
			file = path.join(dest, fileList[i]);
			fs.writeFileSync(file, /*style_html*/(content.replace(new RegExp('<br>','ig'),'<br />')));
		}
	}
}

var style_html = require('./beautify_html.js').style_html;

readGita('./RU', './RU_u', russian_chapter);

console.log('done');
// TODO: сохранить оригинальное форматирование... --- оно есть в текстах.
// заменить <br /> на перенос строки
// <em>...</em> на *...*
// <strong>...</strong>  на *...*
// т.е. имея на руках код можно заменить в исходных файлах санскрит.
// <link>
// <img>
// <br>