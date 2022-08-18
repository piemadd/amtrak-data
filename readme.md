# Amtrak Data
This repository contains the data extracted from [Amtrak's monthly reports](https://www.amtrak.com/reports-documents) in various formats. The repository is structured like so:

```
root
├───data
│   ├───json
│   │   └───{year}
│   │       └───{month}
│   │           ├───operatingResults.json
│   │           ├───capitalResults.json
│   │           ├───keyPerformanceIndicators.json
│   │           ├───sourcesAndUsesAccount.json
│   │           └───routeLevelResults.json
│   ├───csv
│   │   └───{year}
│   │       └───{month}
│   │           ├───operatingResults.csv
│   │           ├───capitalResults.csv
│   │           ├───keyPerformanceIndicators.csv
│   │           ├───sourcesAndUsesAccount.csv
│   │           └───routeLevelResults.csv
│   └───xml
│       └───{year}
│           └───{month}
│               ├───operatingResults.xml
│               ├───capitalResults.xml
│               ├───keyPerformanceIndicators.xml
│               ├───sourcesAndUsesAccount.xml
│               └───routeLevelResults.xml
├───reports
│   └───{year}
│       └───{month}
│           ├───report.pdf
│           └───unprocessed
│               ├───operatingResults.csv
│               ├───capitalResults.csv
│               ├───keyPerformanceIndicators.csv
│               ├───sourcesAndUsesAccount.csv
│               └───routeLevelResults.csv
├───scripts
│   ├───parseRawToJSON.js
│   └───parseJSONtoOthers.js
└───[various config files, including package.json]
```

I used [Tabula](https://tabula.technology/) to extract the table data from PDFs. This will take a bit of manual work and also may not be in the right format for my scripts to process. If I haven't updated this data yet and a report has been published, you email me (on my website) and I will knock it out on one of my lunch breaks.

To run the scripts yourself, clone the repo, make sure you have some modern level of node installed (i think node 14+, not sure tho) and run ye old:

```bash
npm install
```
and to run 

```bash
cd scripts
node parseRawToJSON.js
node parseJSONtoOthers.js
```

All I am doing currently is extracting the data into other formats to allow for further analasys. In the future, I might extend these scripts to do some basic analysis, such as calculating the cost per passenger mile on a route, but leaving the data in the 