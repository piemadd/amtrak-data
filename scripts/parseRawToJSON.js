const { parse } = require("csv-parse/sync");
const fs = require("fs");
const path = require("path");

//pains me, but less than the next funcion
const parseNum = (number) => {
  return Number(
    number
      .replaceAll(",", "")
      .replace("$", "")
      .replace("%", "")
      .replace(")", "")
      .replace("(", "-")
  );
};

//this pains me
const camelCase = ((str) => {
  return str
    .replace(" pp", "")
    .replaceAll("/", " Or ")
    .split("(")[0]
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(' ', '')
    .replace('\r', '')
});

const processFile = (fileName) => {
  const rawData = fs.readFileSync(fileName, "utf8");
  const data = parse(rawData, {
    columns: false,
    skip_empty_lines: true,
  });

  const fileType = fileName.split("tabula-report-")[1].split(".")[0];

  let final = {};

  switch (fileType) {
    case "0":
      console.log(0);
      //removing unnecessary rows
      data.shift();
      data.shift();
      data.shift();

      data.forEach((row) => {
        const parsed = {
          priorYear: parseNum(row[2]),
          currentYearForecast: parseNum(row[9]),
          currentYearActual: parseNum(row[4]),
          growthInDollars: parseNum(row[5] ? row[5] : row[6]),
          growthInPercent: parseNum(row[7]),
          actualVSForecastInDollars: parseNum(row[10].split(" ")[1]),
          actualVSForecastInPercent: parseNum(row[10].split(" ")[2]),
        };

        final[camelCase(row[0])] = parsed;
      });
      break;
    case "1":
      console.log(1);
      //removing unnecessary rows
      data.shift();
      data.shift();
      data.shift();

      data.forEach((row) => {
        const parsed = {
          priorYear: parseNum(row[1]),
          currentYearForecast: parseNum(row[5]),
          currentYearActual: parseNum(row[2]),
          growthInDollars: parseNum(row[4].split(" ")[0]),
          growthInPercent: parseNum(row[4].split(" ")[1]),
          actualVSForecastInDollars: parseNum(row[6].split(" ")[1]),
          actualVSForecastInPercent: parseNum(row[6].split(" ")[2]),
        };

        final[camelCase(row[0])] = parsed;
      });
      break;
    case "2":
      console.log(2);
      //removing unnecessary rows
      data.shift();
      data.shift();
      data.shift();
      data.shift();

      data.forEach((row) => {
        if (row[0].startsWith("Other ")) {
          return;
        }

        const parsed = {
          priorYear: parseNum(row[1]),
          currentYearForecast: parseNum(row[2]),
          currentYearActual: parseNum(row[3]),
          growthInDollars: parseNum(row[5]),
          growthInPercent: parseNum(row[6]),
          actualVSForecastInDollars: parseNum(row[4].split(" ")[0]),
          actualVSForecastInPercent:
            row[4].split(" ")[1] != "pp"
              ? parseNum(row[4].split(" ")[1])
              : parseNum(((parseNum(row[3]) / parseNum(row[1])) * 100).toFixed(2)),
        };

        final[camelCase(row[0])] = parsed;
      });
      break;
    case "3":
      console.log(3);
      //removing unnecessary rows
      data.shift();
      data.shift();

      data.forEach((row) => {
        if (row[1] === '' || row[1] === '-') {
          return;
        }

        const parsed = {
          northEast: parseNum(row[1]),
          national: parseNum(row[2]),
          total: parseNum(row[3]),
        };

        final[camelCase(row[0])] = parsed;
      });
      break;
    case "4":
      console.log(4);
      break;
    default:
      console.log("default");
      break;
  }

  return final;
};

//takes path of folder as input and returns array of json objects
const readFolder = (folderPath) => {
  return fs.readdirSync(folderPath).map((file) => {
    const filePath = path.join(folderPath, file);
    const data = processFile(filePath);
    return data;
  });
};

const readMonth = (month) => {
  console.log(`Parsing ${month}/unprocessed`);
  return readFolder(`${month}/unprocessed`);
};

const readYear = (year) => {
  console.log(`Parsing ${year}`);
  const folderPath = `../reports/${year}`;
  const months = fs.readdirSync(folderPath).map((month) => {
    console.log(`Parsing ../reports/${year}/${month}`);
    return readMonth(`../reports/${year}/${month}`);
  });

  return months;
};

console.log(
  processFile("../reports/2021/august/unprocessed/tabula-report-3.csv")
);
