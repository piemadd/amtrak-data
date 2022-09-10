const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const convert = require('xml-js');

//who needs comments?
fs.readdirSync('../data/json').forEach((year) => {
  fs.readdirSync(`../data/json/${year}`).forEach((month) => {
    console.log(`Parsing ${year}/${month}`);
    fs.readdirSync(`../data/json/${year}/${month}`).map((file, i) => {
      const data = JSON.parse(fs.readFileSync(`../data/json/${year}/${month}/${file}`));
      const dataColumns = Object.keys(data[Object.keys(data)[0]]);
      const dataArr = Object.keys(data).map((key) => {
        return [key, ...Object.values(data[key])];
      })
      console.log('opened')
      const csv = stringify(dataArr, { columns: dataColumns, header: true });
      console.log('csv')
      const xml = convert.json2xml(data, {compact: true, ignoreComment: true, spaces: 2});
      console.log('xml')

      fs.mkdirSync(`../data/csv/${year}/${month}`, { recursive: true });
      fs.mkdirSync(`../data/xml/${year}/${month}`, { recursive: true });

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