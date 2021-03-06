var version = parseInt(process.argv[2]);
if (!version)
	return console.log('Please specify version using `node buildtemplate.js 4`');

const Fs = require('fs');
require('total.js');

var templates = {};
var reg = /exports\.group\s?=\s?['"](.*)['"];/g;
var giturl = 'https://rawgit.com/totaljs/flowcomponents/{0}/{1}/{1}.js';

var count = 0;
var countgroup = 0;

U.ls('./', function callback(files,dirs) {

	dirs.wait(function(dir, next){

		if (dir.startsWith('.') || dir.startsWith('node_modules') || dir.startsWith('__flow'))
			return next();

		count++;

		if (dir[dir.length - 1] === '/')
			dir = dir.substring(0, dir.length - 1);

		var filename = U.join(F.path.root(dir), dir + '.js');
		var url = giturl.format('master', dir);

		var file = Fs.readFileSync(filename, 'utf8');

		var groupname;
		var index = file.indexOf('exports.group');
		if (index > -1) {
			index = file.indexOf('\'', index) || file.indexOf('\"', index);
			var i2 = file.indexOf('\';', index) || file.indexOf('\"', index);
			groupname = file.substring(index + 1, i2);
		}

		getGroup(groupname || 'Common').items.push(url);

		next();
	}, function(){

		var arr = [];
		Object.keys(templates).forEach(i => arr.push(templates[i]));

		Fs.writeFileSync('./templates' + version + '.json', JSON.stringify(arr, null, '\t'));

		console.log('\nCount of components:' + count);
		console.log('Count of groups:' + countgroup++);
		console.log('Template file `templates' + version + '.json` created.');
	});
});

function getGroup(group) {
	if (!templates[group]){
		countgroup++;
		templates[group] = {};
		templates[group].name = group;
		templates[group].items = [];
	}
	return templates[group];
}