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
      totalStatus(ocid)
      hiperstatPreset(ocid)
    })
    .catch(error => console.error(error));
    dataDate.textContent = `* 조회 기준일 : ${baseDate()}`
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
    if(data.character_level < 10) {
      alert("10레벨 이상 캐릭터만 조회 가능합니다.");
      return false;
    }
    const basicList = document.querySelector(".data-basic-list");
    const dataIMG = document.querySelector(".data-img > img");
    const classIMG = document.querySelector(".class-img > img")
    dataIMG.src = `${data.character_image}`;
    classIMG.src = `/2023-12-29-maplestory-data-site/img/${data.character_class}.png`
      basicList.innerHTML = `
        <li class="data-ID">${data.character_name}</li>
        <li class="data-level">LV${data.character_level}</li>
        <li class="data-guild">길드명 : ${data.character_guild_name}</li>
        <li class="data-class">직업 : ${data.character_class}</li>
        <li class="data-sever">서버 : ${data.world_name}</li>
        `;
        if(data.character_guild_name === null) {
          document.querySelector(".data-guild").style.display = "none"
        }
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
    const popularity = document.querySelector(".data-popularity")
    popularity.textContent = `인기도 : ${data.popularity}`
  }
  )
  .catch(error => console.error(error))
}

// 종합 능력치 조회
function totalStatus(ocid) {
  const urlString = `https://open.api.nexon.com/maplestory/v1/character/stat?ocid=${ocid}&date=${baseDate()}`
  fetch(urlString, {
    headers:{
      "x-nxopen-api-key": API_KEY
    }
  })
  .then (response => response.json())
  .then (data => {
    const statPower = document.querySelector(".stat-power")
    let dataFinalStats = data['final_stat']
    let filterPower = data['final_stat'][42]['stat_value'];
    let powerFrontNum = filterPower.slice(0,filterPower.length-4);
    let powerBackNum = filterPower.slice(filterPower.length-4,filterPower.length);

    filterPower.length > 4 ? statPower.textContent = `전투력 : ${powerFrontNum}만 ${powerBackNum}` :statPower.textContent = `전투력 : ${powerBackNum}`

    //스테이터스 값 추출
    let dataFinalStatsValue = Array()
    for(let i = 0; i < dataFinalStats.length; i++) {
      dataFinalStatsValue.push(dataFinalStats[i].stat_value)
    }
    //추출된 스테이터스 값 중 3자릿수 이상 값에 콤마 삽입
    let dataFinalStatsFix = Array()
    for(let i = 0; i < dataFinalStats.length; i++) {
      dataFinalStatsFix.push(Math.floor(dataFinalStats[i].stat_value).toLocaleString())
    }
    statPage1Fun(dataFinalStatsValue,dataFinalStatsFix)
    statPage2Fun(dataFinalStatsValue,dataFinalStatsFix)
  })
}

// 조회 기준 날짜
function baseDate() {
  let d = new Date();
  d.setDate(d.getDate() -1 );// 어제날짜
  d.setHours(d.getHours()-1);// 한 시간 전
  let year    = d.getFullYear();
  let month   = ('0' + (d.getMonth() +  1 )).slice(-2);
  let day     = ('0' + d.getDate()).slice(-2);
  dt = `${year}-${month}-${day}`;
  return dt;
}

// 종합능력치 및 어빌리티 탭메뉴 구현
const tabBtn = document.querySelectorAll(".tab-btn")
tabBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabContent = document.querySelectorAll(".tab-content")
    tabContent.forEach(content => {
      content.classList.add("hidden")
      if(btn.id == content.id) {
        content.classList.remove("hidden")
      }
    })
  })
})

// 능력치 페이지1
function statPage1Fun(data,fixData) {
  const statPage1 = document.querySelector(".char-stat-page1")
  let filterMinPower = data[0];
  let filterMaxPower = data[1];
  let MinpowerFrontNum = filterMinPower.slice(0,filterMinPower.length-4);
  let MaxpowerFrontNum = filterMaxPower.slice(0,filterMaxPower.length-4);
  let MinpowerBackNum = filterMinPower.slice(filterMinPower.length-4,filterMinPower.length);
  let MaxpowerBackNum = filterMaxPower.slice(filterMaxPower.length-4,filterMaxPower.length);
  
  statPage1.innerHTML = `
  <li>최소 스탯공격력 : ${MinpowerFrontNum}만 ${MinpowerBackNum}</li>
  <li>최대 스탯공격력 : ${MaxpowerFrontNum}만 ${MaxpowerBackNum}</li>
  <li>데미지 : ${data[2]}%</li>
  <li>보스 몬스터 데미지 : ${data[3]}%</li>
  <li>일반 몬스터 데미지 : ${data[32]}%</li>
  <li>최종 데미지 : ${data[4]}%</li>
  <li>방어율 무시 : ${data[5]}%</li>
  <li>크리티컬 확률 : ${data[6]}%</li>
  <li>크리티컬 데미지 : ${data[7]}%</li>
  <li>공격력 : ${fixData[40]}</li>
  <li>마력 : ${fixData[41]}</li>
  <li>상태이상 내성 : ${data[8]}</li>
  <li>소환수 지속시간 증가 : ${data[43]}%</li>
  <li>버프 지속시간 : ${data[30]}%</li>
  <li>스타포스 : ${data[13]}</li>
  <li>아케인포스 : ${fixData[14]}</li>
  <li>어센틱포스 : ${data[15]}</li>
  `
}

// 능력치 페이지2
function statPage2Fun(data,fixData) {
  const statPage2 = document.querySelector(".char-stat-page2")
  
  statPage2.innerHTML = `
  <li>STR : ${fixData[16]}</li>
  <li>DEX : ${fixData[17]}</li>
  <li>INT : ${fixData[18]}</li>
  <li>LUK : ${fixData[19]}</li>
  <li>HP : ${fixData[20]}</li>
  <li>MP : ${fixData[21]}</li>
  <li>재사용 대기시간 감소 (%) : ${data[34]}%</li>
  <li>공격 속도 : ${data[31]}단계</li>
  <li>스탠스 : ${fixData[9]}%</li>
  <li>방어력 : ${fixData[10]}</li>
  <li>이동속도 : ${data[11]}%</li>
  <li>점프력 : ${data[12]}%</li>
  <li>속성 내성 무시 : ${data[36]}%</li>
  <li>상태이상 추가 데미지 : ${data[37]}</li>
  <li>메소 획득량 : ${data[29]}%</li>
  <li>아이템 드롭률 : ${data[28]}%</li>
  <li>추가 경험치 획득 : ${data[39]}%</li>
  `
}

// 하이퍼스텟 탭메뉴 구현
const hiperTabBtn = document.querySelectorAll(".hiper-tab-button")
hiperTabBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const hiperTabContent = document.querySelectorAll(".hiper-tab-content")
    hiperTabContent.forEach(content => {
      content.classList.add("hidden")
      if(btn.id == content.id) {
        content.classList.remove("hidden")
      }
    })
  })
})

// 하이퍼스텟 조회
function hiperstatPreset(ocid) {
  const urlString = `https://open.api.nexon.com/maplestory/v1/character/hyper-stat?ocid=${ocid}&date=${baseDate()}`;
  fetch(urlString, {
    headers:{
      "x-nxopen-api-key": API_KEY
    }
  })
  .then(respone => respone.json())
  .then(data => {
    console.log(data)
    preset1(data.hyper_stat_preset_1,data.hyper_stat_preset_1_remain_point)
    preset2(data.hyper_stat_preset_2,data.hyper_stat_preset_2_remain_point)
    preset3(data.hyper_stat_preset_3,data.hyper_stat_preset_3_remain_point)
  })
}

function preset1(hiperData,remainPoint) {
  let hiperStat1 = document.querySelector(".hiper-stat-preset1-page1");
  let hiperStat2 = document.querySelector(".hiper-stat-preset1-page2");
  let hiperRemainPoint = document.querySelector(".hiper-remain-point");

  hiperRemainPoint.textContent = `남은 포인트 : ${remainPoint}`
  hiperStat1.innerHTML = `
    <li>STR : ${hiperData[0].stat_level}</li>
    <li>DEX : ${hiperData[1].stat_level}</li>
    <li>INT : ${hiperData[2].stat_level}</li>
    <li>LUK : ${hiperData[3].stat_level}</li>
    <li>HP : ${hiperData[4].stat_level}</li>
    <li>MP : ${hiperData[5].stat_level}</li>
    <li>DE/TH/PP : ${hiperData[6].stat_level}</li>
    <li>크리티컬 확률 : ${hiperData[7].stat_level}</li>
  `
  hiperStat2.innerHTML = `
  <li>크리티컬 데미지 : ${hiperData[8].stat_level}</li>
  <li>방어율 무시 : ${hiperData[9].stat_level}</li>
  <li>데미지 : ${hiperData[10].stat_level}</li>
  <li>보스몬스터 데미지 증가 : ${hiperData[11].stat_level}</li>
  <li>상태 이상 내성 : ${hiperData[12].stat_level}</li>
  <li>공격력/마력 : ${hiperData[13].stat_level}</li>
  <li>획득 경험치 : ${hiperData[14].stat_level}</li>
  <li>아케인포스 : ${hiperData[15].stat_level}</li>
  <li>일반몬스터 데미지 증가 : ${hiperData[16].stat_level}</li>
`
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