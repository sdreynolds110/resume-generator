const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");
const generateHTML = require("./generateHTML");
const convertFactory = require("electron-html-to");

const conversion = convertFactory({
  converterPath: convertFactory.converters.PDF
});
gitHubInfo = async (username, chosenColor) => {
  let res = await axios.get("https://api.github.com/users/" + username);
  const data = res.data;
  await fs.writeFile(
    "index.html",
    generateHTML.generateHTML(data, chosenColor),
    function(err) {
      if (err) {
        return console.log(err);
      } else {
        console.log("finished");
      }
    }
  );

  await conversion(
    { html: generateHTML.generateHTML(data, chosenColor) },
    function(err, result) {
      if (err) {
        return console.error(err);
      }
      result.stream.pipe(fs.createWriteStream("./index.pdf"));
      conversion.kill();
    }
  );
};


function getUserInput() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter a GitHub username:",
        name: "username"
      },
      {
        type: "input",
        message: "Enter a color:",
        name: "color"
      }
    ])

    .then(answers => {
      const username = answers.username;
      const chosenColor = answers.color;
      gitHubInfo(username, chosenColor);
    });
}

getUserInput();