const fs = require('fs');
const {generate} = require('csv-generate/sync');
const convert = require('xml-js');

//who needs comments?
fs.readdirSync('../data/json').forEach((year) => {
  fs.readdirSync(`../data/json/${year}`).forEach((month) => {
    fs.readdirSync(`../data/json/${year}/${month}`).map((file) => {
      const data = fs.readFileSync(`../data/json/${year}/${month}/${file}`);
      const csv = generate(data);
      const xml = convert.json2xml(data, {compact: true, ignoreComment: true, spaces: 2});

      fs.writeFileSync(`../data/csv/${year}/${month}/${file.replace('.json', '.csv')}`, csv);
      fs.writeFileSync(`../data/xml/${year}/${month}/${file.replace('.json', '.xml')}`, xml);
    });
  });
});

//console.log(JSON.stringify(parsedYears, null, 2));

/*
var json = require('fs').readFileSync('test.json', 'utf8');
var options = {compact: true, ignoreComment: true, spaces: 4};
var result = convert.json2xml(json, options);
console.log(result);
*/