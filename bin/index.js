#! /usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require('node:path');
const monitorConverter = require("../app/monitor-converter");
const dashboardConverter = require("../app/dashboard-converter");

const { Command } = require('commander');
const program = new Command();
const defaultOutputFolder = "output"

function toSnakeCase(str) {
  return str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) // Match words
      .map(x => x.toLowerCase()) // Convert to lowercase
      .join('_'); // Join words with underscores
}

function runConvert(inputFile, resourceName) {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} is not accessible by this script, confirm it exists and allows access`);
  }
  try {
    if (!fs.existsSync(defaultOutputFolder)) {
      fs.mkdirSync(defaultOutputFolder);
    }
  } catch (err) {
    throw new Error(`Unable to create output directory ${defaultOutputFolder}`)
  }
  resourceName = toSnakeCase(resourceName);
  console.log('Input File', `${inputFile}`);
  console.log('Resource Name', `${resourceName}`);
  let json = fs.readFileSync(inputFile).toString();
  const parsedJson = JSON.parse(json);
  let terraformCode;
  if (parsedJson.hasOwnProperty("name")) {
    terraformCode = monitorConverter.generateTerraformCode(resourceName, parsedJson);
  } else {
    terraformCode = dashboardConverter.generateDashboardTerraformCode(resourceName, parsedJson);
  }
  const outputFile = path.join(defaultOutputFolder, `${resourceName}.tf`);
  fs.writeFile(outputFile, terraformCode, (error) => {if (error) {console.log(error)}});
  console.log(`Output file written to ${outputFile}`)
}

program
  .argument('<inputFile>', 'Input json file from datadog')
  .argument('<resourceName>', 'Expected name of the resource')
  .action((inputFile, resourceName) => {
    runConvert(inputFile, resourceName)
  })

program.parse()

// let json;
// switch (process.argv.length) {
//   case 2:
//     json = _fs.default.readFileSync("/dev/stdin").toString();
//     break;
//   case 3:
//     json = _fs.default.readFileSync(process.argv[2]).toString();
//     break;
//   default:
//     console.error("Usage: \nyarn convert < somefile.json\nor\nyarn convert somefile.json");
//     process.exit(1);
// }
// const parsedJson = JSON.parse(json);
// const resourceName = "replaceMeNow";
// const terraformCode = parsedJson.hasOwnProperty("name") ? (0, _monitorConverter.generateTerraformCode)(resourceName, parsedJson) : (0, _dashboardConverter.generateDashboardTerraformCode)(resourceName, parsedJson);
// console.log(terraformCode);