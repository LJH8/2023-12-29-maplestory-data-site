const API_KEY = "test_c7f8cac896768c2a1deb1169957f187bb78d148cf966b40f01fa68cc62b809daf9f496aed5cde632208bdc1eb7968b85";
const mapleID = document.querySelector("#mapleID");
const sendIDbtn = document.querySelector("#sendIDbtn");
const gameData = document.querySelector(".data");

mapleID.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();
    renderData();
    mapleID.value = "";
  }
});

sendIDbtn.addEventListener("click", (data) => {
  data.preventDefault();
  renderData(data);
});

//정보 조회를 위한 캐릭터식별자 코드(ocid)조회
function renderData() {
  const dataDate = document.querySelector(".data-date")
  const characterName = mapleID.value;
  const urlString = "https://open.api.nexon.com/maplestory/v1/id?character_name=" + characterName;

  fetch(urlString, {
    headers: {
      "x-nxopen-api-key": API_KEY
    }
  })
    .then(response => {
      // 유효성 검사
      if(response.status == 400) {
        alert("닉네임이 유효하지 않습니다. 다시 입력해주세요.")
        return false
      } else {
        gameData.classList.remove("hidden");
        return response.json()
      }
    })
    .then(data => {
      const ocid = data.ocid
      basicData(ocid)
      popularity(ocid)
    })
    .catch(error => console.error(error));
    dataDate.textContent = `* 조회 기준일 : ${baseDate()}`
}

// 조회 기준 날짜
function baseDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0'+(today.getMonth()+1)).slice(-2);
  const day = ('0'+(today.getDate()-1)).slice(-2);
  const dateString = `${year}-${month}-${day}`;
  return dateString
}

//기본 정보 조회
function basicData(ocid) {
  const basicUrl = `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}&date=${baseDate()}`;
  fetch(basicUrl, {
    headers: {
      "x-nxopen-api-key": API_KEY
    }
  })
    .then(response => response.json())
    .then(data => {
      const basicList = document.querySelector(".data-basic-list");
      const dataIMG = document.querySelector(".data-img > img");
      const classIMG = document.querySelector(".class-img > img")
      dataIMG.src = `${data.character_image}`;
      classIMG.src = `/23.12.27_maplestory/img/${data.character_class}.png`
      basicList.innerHTML = `
        <li class="data-ID">${data.character_name}</li>
        <li class="data-level">LV${data.character_level}</li>
        <li class="data-guild">길드명 : ${data.character_guild_name}</li>
        <li class="data-class">직업 : ${data.character_class}</li>
        <li class="data-sever">서버 : ${data.world_name}</li>
      `;

    })
    .catch(error => console.error(error));

}



// 인기도 조회
function popularity(ocid) {
  const urlString = `https://open.api.nexon.com/maplestory/v1/character/popularity?ocid=${ocid}&date=${baseDate()}`
  fetch(urlString, {
      headers:{
        "x-nxopen-api-key": API_KEY
      }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const popularity = document.querySelector(".data-popularity")
      popularity.textContent = `인기도 : ${data.popularity}`
    }
      )
    .catch(error => console.error(error))
}



// const urlString = "https://open.api.nexon.com/heroes/v1/id?character_name=" + characterName;

// const answer = fetch(urlString, {
//     headers:{
//       "x-nxopen-api-key": API_KEY
//     }
// })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error(error))

// console.log(answer)


// c4fa4f302b50ef30210de4cff41172d1