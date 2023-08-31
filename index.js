const { doCLIParsing, doFileReadParsing } = require("./dist/index.js");

const main = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    doFileReadParsing(args[0]);
  } else {
    doCLIParsing();
  }
};

main();
