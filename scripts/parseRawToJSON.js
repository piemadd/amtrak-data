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

      mooshed.forEach((row, i) => {
        if (row.length == 0) return;
        if (data[i][0].length == 0) return;

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
      console.log("processing file type 2");

      mooshed.forEach((row, i) => {
        if (row.length == 0) return;
        if (data[i][0].length == 0) return;

        const parsed = {
          priorYear: row[0] * 1000,
          currentYearForecast: row[1] * 1000,
          currentYearActual: row[2] * 1000,
          growthInRiders: row[5] * 1000,
          growthInPercent: row[6] * 1000,
          actualVSForecastInRiders: row[3] * 1000,
          actualVSForecastInPercent: row[4],
        };

        final[camelCase(data[i][0])] = parsed;
      });
      break;
    case "3":
      console.log("processing file type 3");

      mooshed.forEach((row, i) => {
        if (row.length == 0) return;
        if (data[i][0].length == 0) return;

        const parsed = {
          necAccounts: row[0] * 1000,
          nationalNetworkAccount: row[1] * 1000,
          total: row[2] * 1000,
        };

        final[camelCase(data[i][0])] = parsed;  
      });
      break;
    case "4":
      console.log("processing file type 4");

      mooshed.forEach((row, i) => {
        if (row.length == 0) return;
        if (data[i][0].length == 0) return;

        const parsed = {
          operatingRevenue: row[0] * 1000000,
          operatingExpenses: row[1] * 1000000,
          adjustedEarnings: row[2] * 1000000,
          ridership: row[3] * 1000,
          seatMiles: row[4] * 1000000,
          passengerMiles: row[5] * 1000000,
          trainMiles: row[row.length - 2] * 1000,
          frequencies: row[row.length - 1] * 1000,
        };

        final[camelCase(data[i][0])] = parsed;
      });
    default:
      console.log("default");
      break;
  }

  return final;
};

//takes path of folder as input and returns array of json objects
const readFolder = (folderPath, save = true) => {
  const fileNames = ['operatingResults', 'capitalResults', 'keyPerformanceIndicators', 'sourcesAndUsesAccount', 'routeLevelResults'];

  const finalizedData = fs.readdirSync(folderPath).map((file) => {
    const filePath = path.join(folderPath, file);
    console.log("processing file ", filePath);
    const data = processFile(filePath);
    return data;
  });

  if (save) {
    finalizedData.forEach((file, i) => {
      const year = parseNum(folderPath.replaceAll('\\', '/').split('/')[2]);
      const month = folderPath.replaceAll('\\', '/').split('/')[3];
      const fileFolderPath = `../data/json/${year}/${month}`;
      const filePath = `${fileFolderPath}/${fileNames[i]}.json`;
      console.log('saving to ', filePath)
      
      fs.mkdirSync(fileFolderPath, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
    })
  }

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

const readAll = (() => {
  console.log("Parsing all");
  const folderPath = `../reports`;
  const years = fs.readdirSync(folderPath).map((year) => {
    console.log(`Parsing ../reports/${year}`);
    return readYear(year);
  });

  return years;
});

readAll()

/*
console.log(
  readMonth("../reports/2021/august")
);
*/

/*
console.log(
  processFile("../reports/2021/august/unprocessed/tabula-report-4.csv")
);
*/

/*
const rawData = fs.readFileSync(
  "../reports/2021/september/unprocessed/tabula-report-4.csv",
  "utf8"
);
const data = parse(rawData, { columns: false, skip_empty_lines: true });
console.log(moosh(data));
*/
