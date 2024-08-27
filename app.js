const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const marked = require("marked");

const directoryPath = "./pages";
const files = fs.readdirSync(directoryPath);
files.forEach((file) => {
  const filePath = path.join(directoryPath, file);
  if (fs.statSync(filePath).isFile() && path.extname(file) === ".html") {
    fs.unlinkSync(filePath); // 同步删除文件
    console.log(`已删除: ${filePath}`);
  }
});

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".svg",
];

const isImage = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  return imageExtensions.includes(ext);
};

function svgToBase64(svgString) {
  return "data:image/svg+xml;base64," + btoa(svgString);
}

function getDirectoryStructure(dirPath) {
  const result = {};
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      result[item] = getDirectoryStructure(itemPath);
    } else {
      if (isImage(item)) {
        const fileContent = fs.readFileSync(itemPath);
        const base64Content = fileContent.toString("base64");
        if (itemPath.includes(".svg")) {
          result[item] = svgToBase64(fileContent);
        } else {
          result[item] = `data:image/${path
            .extname(item)
            .slice(1)};base64,${base64Content}`;
        }
      } else {
        const fileContent = fs.readFileSync(itemPath, "utf-8");
        if (itemPath.includes(".md")) {
          result[item] = marked.parse(fileContent);
        } else {
          result[item] = fileContent;
        }
      }
    }
  });
  return result;
}

function getCodesDirectoryStructure() {
  const codesDirPath = path.join(__dirname, "./pages/articles");
  const codesDirs = fs.readdirSync(codesDirPath);
  const result = {};
  codesDirs.forEach((dir) => {
    const dirPath = path.join(codesDirPath, dir);
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      result[dir] = getDirectoryStructure(dirPath);
    }
  });
  return result;
}

const structure = getCodesDirectoryStructure();

const keyArrs = Object.keys(structure);

// [ 'responsive temple website' ]
console.log("keyArrs", keyArrs);

let uniqueId = 0;

function convertToHTML(structure, parentPath = "") {
  let html = "<ul>";
  for (const key in structure) {
    if (structure.hasOwnProperty(key)) {
      uniqueId++;
      const currentPath = parentPath ? `${parentPath}/${key}` : key;
      if (typeof structure[key] === "object") {
        html += `<li><h3 class="toggle"><svg class="arrow" t="1724246494118" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13569" width="200" height="200"><path d="M472.064 751.552 72.832 352.32c-22.08-22.08-22.08-57.792 0-79.872 22.016-22.016 57.792-22.08 79.872 0L512 631.744l359.296-359.296c22.016-22.016 57.792-22.08 79.872 0 22.08 22.08 22.016 57.792 0 79.872l-399.232 399.232C529.856 773.568 494.144 773.568 472.064 751.552z" fill="rgb(146,146,146)" p-id="13570"></path></svg><svg t="1724244827594" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4320" width="200" height="200"><path d="M1024 0H0v1024h1024V0z" fill="rgb(146,146,146)" fill-opacity=".01" p-id="4321"></path><path d="M49.777778 192A78.222222 78.222222 0 0 1 128 113.777778h293.973333l106.666667 128h271.36a78.222222 78.222222 0 0 1 78.222222 78.222222V483.555556H219.761778L119.836444 883.285333 49.777778 874.666667v-682.666667zM128 184.888889a7.111111 7.111111 0 0 0-7.111111 7.111111v393.841778L164.238222 412.444444h642.872889v-92.444444a7.111111 7.111111 0 0 0-7.111111-7.111111h-304.64l-106.666667-128H128z" fill="rgb(146,146,146)" p-id="4322"></path><path d="M159.971556 412.444444h822.044444l-99.555556 497.777778H40.248889l119.751111-497.777778z m56.035555 71.111112L130.446222 839.111111h693.76l71.111111-355.555555H215.978667z" fill="rgb(146,146,146)" p-id="4323"></path></svg>${key}</h3>${convertToHTML(
          structure[key],
          currentPath
        )}</li>`;
      } else {
        html += `<li data-id="${uniqueId}" data-path="${currentPath}">${key}</li>`;
      }
    }
  }
  html += "</ul>";
  return html;
}

const editPage = fs.readFileSync("./templates/edit.html", "utf-8");

const initFun = () => {
  let urls = [];
  let _idx = -1;
  for (const key in structure) {
    _idx++;
    const detailHTML = ejs.render(editPage, {
      nav: convertToHTML(structure[key]),
      datas: structure[key],
      key,
      url: `./articles/${key}`,
    });
    const htmlName = `./pages/${key}.html`;
    const outputFilePath = path.join(__dirname, htmlName);
    fs.writeFileSync(outputFilePath, detailHTML, "utf-8");
    urls.push(key);
  }
  //   處理首頁
  // 处理首页
  const homeTemplateContent = fs.readFileSync(
    "./templates/index.html",
    "utf-8"
  );
  const homeOutputFilePath = path.join(__dirname, `./pages/index.html`);
  let homeHTML = `<ul>`;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    homeHTML += `<li><a href="/${url}.html">${url}</a></li>`;
  }
  homeHTML += `</ul>`;
  const homeTempHTML = ejs.render(homeTemplateContent, {
    list: homeHTML,
  });
  fs.writeFileSync(homeOutputFilePath, homeTempHTML, "utf-8");
};

initFun();
