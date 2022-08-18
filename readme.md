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
│               ├───0.csv
│               ├───1.csv
│               ├───2.csv
│               ├───3.csv
│               └───4.csv
└───scripts
    ├───parseRawToJSON.js
    └───parseJSONtoOthers.js
```