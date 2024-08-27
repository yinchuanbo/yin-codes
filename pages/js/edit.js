let editor = null;

let imgArr = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];

const getData = () => {
  const preDom = document.querySelector("#pre");
  const html = preDom.innerHTML;
  return JSON.parse(html);
};

function decodeHtmlEntities(encodedString) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = encodedString;
  return textarea.value;
}

function getDataByPath(data, path) {
  const keys = path.split("/");
  const fileName = keys.pop();
  const fileExtension = fileName.split(".").pop();
  let result = data;
  for (const key of keys) {
    if (result[key] !== undefined) {
      result = result[key];
    } else {
      return { data: null, extension: null };
    }
  }
  return { data: result[fileName], extension: fileExtension };
}

const loadCSS = (url) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
};

const loadJS = (url, callback) => {
  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.body.appendChild(script);
};

const removeCSS = (filename) => {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    if (link.href.includes(filename)) {
      link.parentNode.removeChild(link);
    }
  });
};

// Function to remove loaded JS file
const removeJS = (filename) => {
  const scripts = document.querySelectorAll("script");
  scripts.forEach((script) => {
    if (script.src.includes(filename)) {
      script.parentNode.removeChild(script);
    }
  });
};

const renderContent = ({ filename, data, extension, isImg }) => {
  const wrapperContent = document.querySelector(".wrapper-content");
  if (editor) editor.dispose();
  if (wrapperContent) {
    wrapperContent.innerHTML = "";
    wrapperContent.classList.remove("isImg", "md");
  }
  if (!isImg) {
    if (extension === "md") {
      // wrapperContent.style.opacity = 0
      wrapperContent.innerHTML = `${decodeHtmlEntities(data)}`;
      wrapperContent.classList.add("md");
      removeCSS("prism.css");
      removeJS("prism.min.js");
      loadCSS("../css/prism.css");
      loadJS("../js/prism.min.js", () => {
        console.log("Prism.js has been loaded");
        // wrapperContent.style.opacity = 1
      });
    } else {
      require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs",
        },
      });
      require(["vs/editor/editor.main"], function () {
        monaco.editor.defineTheme("myCustomTheme", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "999999", fontStyle: "italic"},
          ],
          colors: {
            "editor.foreground": "#D4D4D4",
            "editor.selectionBackground": "#264F78",
            "editor.lineHighlightBackground": "#242424",
            "editor.inactiveSelectionBackground": "#3B3A30",
            "editorIndentGuide.background": "#2A2D2E",
            "editorIndentGuide.activeBackground": "#2A2D2E",
          },
        });
        monaco.editor.setTheme("myCustomTheme");
        editor = monaco.editor.create(wrapperContent, {
          value: decodeHtmlEntities(data),
          language: extension === "js" ? "javascript" : extension,
          automaticLayout: true,
          theme: "myCustomTheme",
          wordWrap: "on",
          fontSize: 16,
          fontFamily: "JetBrains Mono",
          // letterSpacing: 0.7,
          // scrollbar: {
          //   vertical: "hidden",
          //   horizontal: "hidden",
          // },
          lineNumbers: true,
          lineHeight: 30,
          minimap: {
            enabled: false,
          },
        });
      });
    }
  } else {
    const imgBase64 = `<img src="${data}" />`;
    wrapperContent.classList.add("isImg");
    wrapperContent.insertAdjacentHTML("afterbegin", imgBase64);
  }
};

const initFirstArticle = (articlesData = null) => {
  const firstLi = document.querySelector("li[data-id]");
  if (firstLi) {
    firstLi.classList.add("active");
    const path = firstLi.dataset.path;
    const filename = firstLi.textContent.trim();
    const { data, extension } = getDataByPath(articlesData, path);
    if (!imgArr.includes(extension)) {
      renderContent({
        filename,
        data,
        extension,
        isImg: false,
      });
    } else {
      renderContent({
        filename,
        data,
        extension,
        isImg: true,
      });
    }
  }
};

const changeFile = (articlesData = null) => {
  const LiAlls = document.querySelectorAll("li[data-id]");
  for (let i = 0; i < LiAlls.length; i++) {
    const element = LiAlls[i];
    element.onclick = () => {
      const activeDom = document.querySelector("li[data-id].active");
      activeDom.classList.remove("active");
      element.classList.add("active");
      const path = element.dataset.path;
      const filename = element.textContent.trim();
      const { data, extension } = getDataByPath(articlesData, path);
      if (!imgArr.includes(extension)) {
        renderContent({
          filename,
          data,
          extension,
          isImg: false,
        });
      } else {
        renderContent({
          filename,
          data,
          extension,
          isImg: true,
        });
      }
    };
  }
};

const extand = () => {
  const toggle = document.querySelectorAll(".toggle");
  toggle.forEach((item) => {
    item.onclick = () => {
      const next = item.nextElementSibling;
      next.classList.toggle("noextand");
    };
  });
};

window.onload = () => {
  const articlesData = getData();
  console.log("articlesData", articlesData);
  initFirstArticle(articlesData);
  changeFile(articlesData);
  extand();
};
