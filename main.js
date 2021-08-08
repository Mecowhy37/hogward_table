import "./style.scss";

("use strict");
window.addEventListener("load", setUp);
let originalList = [];
let editableList = [];
async function setUp() {
  const res1 = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const res2 = await fetch("https://petlatkea.dk/2021/hogwarts/families.json");
  const data1 = await res1.json();
  const data2 = await res2.json();
  const data1clean = cleanNames(data1);
  mainList(data1clean, data2);
  controller();
  setSticky();
}
function mainList(data1clean, data2) {
  data1clean.forEach((obj) => {
    let blood = data2.pure.includes(obj.lastName) ? "pure" : "half";
    let picture = `${obj.lastName.toLowerCase()}_${obj.firstName.charAt(0).toLowerCase()}.png`;
    Object.assign(obj, { prefect: false, watchList: false, expel: false, blood: blood, face: picture });
    originalList.push(obj);
  });
  editableList = [...originalList];
}
function cleanNames(data1) {
  data1.forEach((jsonObj) => {
    const fullName = jsonObj.fullname.trim().toLowerCase().split(" ");
    const firstName = fullName[0][0].toUpperCase() + fullName[0].slice(1);
    let lastName = fullName.length == 1 ? "" : fullName[fullName.length - 1][0].toUpperCase() + fullName[fullName.length - 1].slice(1);
    if (lastName.includes("-")) {
      const hyphen = lastName.indexOf("-");
      lastName = lastName.replace(lastName[hyphen + 1], lastName[hyphen + 1].toUpperCase());
    } else if (firstName == "Leanne") {
      lastName = "Runcorn";
    }
    let nickName = "";
    let midName = "";
    if (fullName.length == 3) {
      if (fullName[1].includes('"')) {
        nickName = fullName[1][1].toUpperCase() + fullName[1].slice(2).replace('"', "").replace('"', "");
      } else {
        midName = fullName[1][0].toUpperCase() + fullName[1].slice(1);
      }
    }
    delete jsonObj.fullname;
    jsonObj.firstName = firstName;
    jsonObj.midName = midName;
    jsonObj.lastName = lastName;
    jsonObj.nickName = nickName;
    const house = jsonObj.house.toLowerCase().trim();
    jsonObj.house = house[0].toUpperCase() + house.slice(1);
  });
  return data1;
}

document.querySelectorAll(".head").forEach((el) => {
  el.querySelector('input[name="sort"]').direction = "down";
  el.onclick = (e) => {
    document.querySelectorAll(".head").forEach((es) => {
      let input = es.querySelector('input[name="sort"]');
      if (es === e.target) {
        if (input.checked === true) {
          if (input.direction === "down") {
            input.direction = "up";
          } else {
            input.direction = "down";
            // input.checked = false;
          }
        } else {
          input.checked = true;
        }
      } else {
        input.checked = false;
        input.direction = "down";
      }
      input.parentElement.querySelector(".direction").textContent = input.direction;
    });
    controller();
  };
});

const searchBar = document.querySelector("#search");
const grouping = document.querySelector("#grouping");
searchBar.oninput = grouping.onchange = () => {
  controller();
};

const controller = () => {
  console.log(editableList);
  let selected = document.querySelector('input[name="sort"]:checked');
  if (selected) {
    const [param, direction] = [selected.id, selected.direction];
    console.log(param, direction);
    editableList.sort((a, b) => {
      if (a[param] < b[param]) {
        return direction === "down" ? -1 : 1;
      }
      if (a[param] > b[param]) {
        return direction === "down" ? 1 : -1;
      }
      return 0;
    });
  } else {
    console.log("none selected");
  }
  let trimmedList = [];

  console.log(grouping.value);
  switch (grouping.value) {
    case "all":
      trimmedList = [...editableList];
      break;
    case "all students":
      trimmedList = editableList.filter((x) => (x.expel ? null : x));
      break;
    case "expeled":
      trimmedList = editableList.filter((x) => (x.expel ? x : null));
      break;
    case "watchlist":
      trimmedList = editableList.filter((x) => (x.watchList ? x : null));
      break;
    case "prefects":
      trimmedList = editableList.filter((x) => (x.prefect ? x : null));
      break;
    case "Gryffindor":
      trimmedList = editableList.filter((x) => (x.house === "Gryffindor" ? x : null));
      break;
    case "Hufflepuff":
      trimmedList = editableList.filter((x) => (x.house === "Hufflepuff" ? x : null));
      break;
    case "Ravenclaw":
      trimmedList = editableList.filter((x) => (x.house === "Ravenclaw" ? x : null));
      break;
    case "Slytherin":
      trimmedList = editableList.filter((x) => (x.house === "Slytherin" ? x : null));
      break;
    default:
      break;
  }
  let searchedList = [...trimmedList];
  if (searchBar.value) {
    let searching = `${searchBar.value.toLowerCase()}`;
    searchedList = trimmedList.filter((x) => {
      if (x.firstName.toLowerCase().includes(searching) || x.lastName.toLowerCase().includes(searching) || x.midName.toLowerCase().includes(searching)) {
        return x;
      } else {
        return;
      }
    });
  }
  viewer(searchedList);
};

const viewer = (toDisplay) => {
  [...document.querySelectorAll("#table_wrapper .row")].forEach((el) => el.remove());
  toDisplay.forEach((stud) => {
    let clone = document.getElementById("studentRowTemp").content.cloneNode(true);
    clone.querySelector(".fn").textContent = stud.firstName;
    clone.querySelector(".mn").textContent = stud.midName;
    clone.querySelector(".ln").textContent = stud.lastName;
    clone.querySelector(".g").textContent = stud.gender;
    clone.querySelector(".h").textContent = stud.house;
    clone.querySelector(".b").textContent = stud.blood;
    clone.querySelector(".p").textContent = stud.prefect;
    if (stud.prefect) {
      clone.querySelector(".p").classList.add("true");
    } else {
      clone.querySelector(".p").classList.remove("true");
    }
    clone.querySelector(".e").textContent = stud.expel;
    if (stud.expel) {
      clone.querySelector(".e").classList.add("true");
    } else {
      clone.querySelector(".e").classList.remove("true");
    }
    clone.querySelector(".w").textContent = stud.watchList;
    if (stud.watchList) {
      clone.querySelector(".w").classList.add("true");
    } else {
      clone.querySelector(".w").classList.remove("true");
    }
    document.querySelector("#table_wrapper").appendChild(clone);
  });
  actions();
};

const setSticky = () => {
  let widthsPX = [];
  [...document.querySelectorAll(".head")].forEach((el, index) => {
    widthsPX.push(`${el.getBoundingClientRect().width}px`);
    el.style.width = widthsPX[index];
  });
  document.querySelector("#table_wrapper").style.gridTemplateColumns = widthsPX.join(" ");
  document.querySelector(".header").classList.add("sticked");
};

function actions() {
  [...document.querySelectorAll(".action")].forEach((el) => {
    el.onclick = (e) => {
      changeVList(e);
      controller();
    };
  });
}

function changeVList(e) {
  let targetObj = editableList.find((el) => el.firstName === e.target.parentElement.querySelector(".fn").textContent);
  if (e.target.classList.contains("p")) {
    targetObj.prefect = !targetObj.prefect;
  }
  if (e.target.classList.contains("e")) {
    targetObj.expel = !targetObj.expel;
  }
  if (e.target.classList.contains("w")) {
    targetObj.watchList = !targetObj.watchList;
  }
}
