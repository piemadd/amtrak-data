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
const camelCase = (str) => {
  return str
    .replace(" pp", "")
    .replaceAll("/", " Or ")
    .split("(")[0]
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(" ", "")
    .replace("\r", "");
};

//takes an array of an array which gets rid of empty cells and splits apart cells with multiple values (split by a space)
const moosh = (arr) => {
  arr = JSON.parse(JSON.stringify(arr)); //stupid deep copy
  let newArr = [];

  for (let i = 0; i < arr.length; i++) {
    let row = arr[i];
    let newRow = [];

    //skipping row if it is mostly empty
    let countNotEmpty = 0;
    row.forEach((cell) => {
      if (cell !== "") countNotEmpty++;
    });

    if (countNotEmpty > row.length / 4) {
      for (let j = 0; j < row.length; j++) {
        if (row[j].includes(" ")) {
          row.splice(j, 1, ...row[j].split(" "));
        }

        if (row[j] === "N/A" || row[j] === "-") {
          row[j] = "0";
        }

        if (isNaN(parseNum(row[j])) || row[j] === "" || row[j] === "$") {
          row.splice(j, 1);
          j--;
          continue;
        }

        newRow.push(parseNum(row[j]));
      }
    }

    newArr.push(newRow);
  }

  return newArr;
};

const processFile = (fileName) => {
  const rawData = fs.readFileSync(fileName, "utf8");
  const data = parse(rawData, {
    columns: false,
    skip_empty_lines: true,
  });

  const mooshed = moosh(data);

  const fileType = fileName.split("tabula-report-")[1].split(".")[0];

  let final = {};

  switch (fileType) {
    case "0":
    case "1":
      console.log("processing file type 0 or 1");
      //removing unnecessary rows
      for (let i = 0; i < 3; i++) {
        data.shift();
        mooshed.shift();
      }

      mooshed.forEach((row, i) => {
        if (row.length == 0) return;

        const parsed = {
          priorYear: row[0] * 1000000,
          currentYearForecast: row[4] * 1000000,
          currentYearActual: row[1] * 1000000,
          growthInDollars: row[2] * 1000000,
          growthInPercent: row[3],
          actualVSForecastInDollars: row[6] * 1000000,
          actualVSForecastInPercent: row[7],
        };

        final[camelCase(data[i][0])] = parsed;
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
          priorYear: parseNum(row[1]) * 1000,
          currentYearForecast: parseNum(row[2]) * 1000,
          currentYearActual: parseNum(row[3]) * 1000,
          growthInNumbers: parseNum(row[5]) * 1000,
          growthInPercent: parseNum(row[6]),
          actualVSForecastInNumbers: parseNum(row[4].split(" ")[0]),
          actualVSForecastInPercent:
            row[4].split(" ")[1] != "pp"
              ? parseNum(row[4].split(" ")[1])
              : parseNum(
                  ((parseNum(row[3]) / parseNum(row[1])) * 100).toFixed(2)
                ),
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
        if (row[1] === "" || row[1] === "-") {
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
      //removing unnecessary rows
      data.shift();
      data.shift();
      data.shift();

      data.forEach((row, i) => {
        if (row[1] === "" || row[1] === "-") {
          return;
        }

        let parsed = {
          operatingRevenue: parseNum(row[1]) * 1000000,
          operatingExpenses: parseNum(row[3]) * 1000000,
          operatingEarnings: parseNum(row[5]) * 1000000,
          ridership: row[6] !== "" ? parseNum(row[6]) * 1000 : 0,
          seatMiles:
            row[7] !== "" ? parseNum(row[7].split(" ")[0]) * 1000000 : 0,
          passengerMiles:
            row[7] !== "" ? parseNum(row[7].split(" ")[1]) * 1000000 : 0,
          averageLoadFactor: row[8] !== "" ? parseNum(row[8]) : 0,
          onTimePerformance: row[9] !== "" ? parseNum(row[9]) : 0,
          trainMiles: parseNum(row[10]) * 1000000,
          frequencies: parseNum(row[11]),
        };

        if (i > 0 && data[i - 1] && data[i - 1][8] === "N/A") {
          parsed.operatingRevenue +=
            data[i - 1][1] === "N/A" ? 0 : parseNum(data[i - 1][1]) * 1000000;
          parsed.operatingExpenses +=
            data[i - 1][3] === "N/A" ? 0 : parseNum(data[i - 1][3]) * 1000000;
          parsed.operatingEarnings +=
            data[i - 1][5] === "N/A" ? 0 : parseNum(data[i - 1][5]) * 1000000;
          parsed.ridership +=
            data[i - 1][6] === "N/A" ? 0 : parseNum(data[i - 1][6]);
          parsed.seatMiles +=
            data[i - 1][7].split(" ")[0] === "N/A"
              ? 0
              : parseNum(data[i - 1][7].split(" ")[0]) * 1000000;
          parsed.passengerMiles +=
            data[i - 1][7].split(" ")[1] === "N/A"
              ? 0
              : parseNum(data[i - 1][7].split(" ")[1]) * 1000000;
          parsed.averageLoadFactor +=
            data[i - 1][8] === "N/A" ? 0 : parseNum(data[i - 1][8]);
          parsed.onTimePerformance +=
            data[i - 1][9] === "N/A" ? 0 : parseNum(data[i - 1][9]);
          parsed.trainMiles +=
            data[i - 1][10] === "N/A" ? 0 : parseNum(data[i - 1][10]) * 1000000;
          parsed.frequencies +=
            data[i - 1][11] === "N/A" ? 0 : parseNum(data[i - 1][11]);
        }

        final[camelCase(row[0])] = parsed;
      });

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
    console.log("processing file ", filePath);
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

/*
console.log(
  readMonth("../reports/2021/august")
);
*/

console.log(
  processFile("../reports/2021/august/unprocessed/tabula-report-1.csv")
);

/*
const rawData = fs.readFileSync(
  "../reports/2021/september/unprocessed/tabula-report-4.csv",
  "utf8"
);
const data = parse(rawData, { columns: false, skip_empty_lines: true });
console.log(moosh(data));
*/
