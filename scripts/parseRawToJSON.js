const { parse } = require("csv-parse/sync");
const fs = require("fs");
const path = require("path");

const parseNum = (number) => {
  return Number(
    number
      .replace(",", "")
      .replace("$", "")
      .replace("%", "")
      .replace(")", "")
      .replace("(", "-")
  );
};

const camelCase = (str) => {
  str = str
    .replace("/", "")
    .replace("(Loss)", "")
    .replace("(", "")
    .replace(")", "");
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

const processFile = (fileName) => {
  const rawData = fs.readFileSync(fileName, "utf8");
  const data = parse(data, {
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

      console.log(final);
      break;
    case "1":
      console.log(1);
      break;
    case "2":
      console.log(2);
      break;
    case "3":
      console.log(3);
      break;
    case "4":
      console.log(4);
      break;
    default:
      console.log("default");
      break;
  }
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

processFile("../reports/2021/august/unprocessed/tabula-report-0.csv");
