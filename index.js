const API_KEY = "test_c7f8cac896768c2a1deb1169957f187bb78d148cf966b40f01fa68cc62b809daf9f496aed5cde632208bdc1eb7968b85";
const mapleID = document.querySelector("#mapleID");
const sendIDbtn = document.querySelector("#sendIDbtn");
const gameData = document.querySelector(".data");
const eqipStatBase = document.querySelector(".item-equipment-stat-base");

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
      ability(ocid)
      eqip(ocid)
    })
    .catch(error => console.error(error));
    dataDate.textContent = `* 조회 기준일 : ${baseDate()}`
    document.querySelector(".data-bg").style.display = "block"
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
    // for(let i = 1; i<4; i++) {
    //   console.log(data)
    // }
    preset1(data.hyper_stat_preset_1,data.hyper_stat_preset_1_remain_point)
    preset2(data.hyper_stat_preset_2,data.hyper_stat_preset_2_remain_point)
    preset3(data.hyper_stat_preset_3,data.hyper_stat_preset_3_remain_point)
  })
}

// 하이퍼스텟 프리셋1
function preset1(hiperData,remainPoint) {
  let hiperStat1 = document.querySelector(".hiper-stat-preset1-page1");
  let hiperStat2 = document.querySelector(".hiper-stat-preset1-page2");
  let hiperRemainPoint = document.querySelector(".hiper-preset1-remain-point");

  hiperRemainPoint.textContent = `남은 포인트 : ${remainPoint}`
  hiperStat1.innerHTML = `
    <li>STR : Lv. ${hiperData[0].stat_level}</li>
    <li>DEX : Lv. ${hiperData[1].stat_level}</li>
    <li>INT : Lv. ${hiperData[2].stat_level}</li>
    <li>LUK : Lv. ${hiperData[3].stat_level}</li>
    <li>HP : Lv. ${hiperData[4].stat_level}</li>
    <li>MP : Lv. ${hiperData[5].stat_level}</li>
    <li>DE/TH/PP : Lv. ${hiperData[6].stat_level}</li>
    <li>크리티컬 확률 : Lv. ${hiperData[7].stat_level}</li>
  `
  hiperStat2.innerHTML = `
    <li>크리티컬 데미지 : Lv. ${hiperData[8].stat_level}</li>
    <li>방어율 무시 : Lv. ${hiperData[9].stat_level}</li>
    <li>데미지 : Lv. ${hiperData[10].stat_level}</li>
    <li>보스몬스터 데미지 증가 : Lv. ${hiperData[11].stat_level}</li>
    <li>상태 이상 내성 : Lv. ${hiperData[12].stat_level}</li>
    <li>공격력/마력 : Lv. ${hiperData[13].stat_level}</li>
    <li>획득 경험치 : Lv. ${hiperData[14].stat_level}</li>
    <li>아케인포스 : Lv. ${hiperData[15].stat_level}</li>
    <li>일반몬스터 데미지 증가 : Lv. ${hiperData[16].stat_level}</li>
  `
}

// 하이퍼스텟 프리셋2
function preset2(hiperData,remainPoint) {
  let hiperStat1 = document.querySelector(".hiper-stat-preset2-page1");
  let hiperStat2 = document.querySelector(".hiper-stat-preset2-page2");
  let hiperRemainPoint = document.querySelector(".hiper-preset2-remain-point");

  hiperRemainPoint.textContent = `남은 포인트 : ${remainPoint}`
  hiperStat1.innerHTML = `
    <li>STR : Lv. ${hiperData[0].stat_level}</li>
    <li>DEX : Lv. ${hiperData[1].stat_level}</li>
    <li>INT : Lv. ${hiperData[2].stat_level}</li>
    <li>LUK : Lv. ${hiperData[3].stat_level}</li>
    <li>HP : Lv. ${hiperData[4].stat_level}</li>
    <li>MP : Lv. ${hiperData[5].stat_level}</li>
    <li>DE/TH/PP : Lv. ${hiperData[6].stat_level}</li>
    <li>크리티컬 확률 : Lv. ${hiperData[7].stat_level}</li>
  `
  hiperStat2.innerHTML = `
    <li>크리티컬 데미지 : Lv. ${hiperData[8].stat_level}</li>
    <li>방어율 무시 : Lv. ${hiperData[9].stat_level}</li>
    <li>데미지 : Lv. ${hiperData[10].stat_level}</li>
    <li>보스몬스터 데미지 증가 : Lv. ${hiperData[11].stat_level}</li>
    <li>상태 이상 내성 : Lv. ${hiperData[12].stat_level}</li>
    <li>공격력/마력 : Lv. ${hiperData[13].stat_level}</li>
    <li>획득 경험치 : Lv. ${hiperData[14].stat_level}</li>
    <li>아케인포스 : Lv. ${hiperData[15].stat_level}</li>
    <li>일반몬스터 데미지 증가 : Lv. ${hiperData[16].stat_level}</li>
  `
}

// 하이퍼스텟 프리셋3
function preset3(hiperData,remainPoint) {
  let hiperStat1 = document.querySelector(".hiper-stat-preset3-page1");
  let hiperStat2 = document.querySelector(".hiper-stat-preset3-page2");
  let hiperRemainPoint = document.querySelector(".hiper-preset3-remain-point");

  hiperRemainPoint.textContent = `남은 포인트 : ${remainPoint}`
  hiperStat1.innerHTML = `
    <li>STR : Lv. ${hiperData[0].stat_level}</li>
    <li>DEX : Lv. ${hiperData[1].stat_level}</li>
    <li>INT : Lv. ${hiperData[2].stat_level}</li>
    <li>LUK : Lv. ${hiperData[3].stat_level}</li>
    <li>HP : Lv. ${hiperData[4].stat_level}</li>
    <li>MP : Lv. ${hiperData[5].stat_level}</li>
    <li>DE/TH/PP : Lv. ${hiperData[6].stat_level}</li>
    <li>크리티컬 확률 : Lv. ${hiperData[7].stat_level}</li>
  `
  hiperStat2.innerHTML = `
    <li>크리티컬 데미지 : Lv. ${hiperData[8].stat_level}</li>
    <li>방어율 무시 : Lv. ${hiperData[9].stat_level}</li>
    <li>데미지 : Lv. ${hiperData[10].stat_level}</li>
    <li>보스몬스터 데미지 증가 : Lv. ${hiperData[11].stat_level}</li>
    <li>상태 이상 내성 : Lv. ${hiperData[12].stat_level}</li>
    <li>공격력/마력 : Lv. ${hiperData[13].stat_level}</li>
    <li>획득 경험치 : Lv. ${hiperData[14].stat_level}</li>
    <li>아케인포스 : Lv. ${hiperData[15].stat_level}</li>
    <li>일반몬스터 데미지 증가 : Lv. ${hiperData[16].stat_level}</li>
  `
}

// 어빌리티
function ability(ocid){
  const urlString = `https://open.api.nexon.com/maplestory/v1/character/ability?ocid=${ocid}&date=${baseDate()}`;
  fetch(urlString, {
    headers:{
      "x-nxopen-api-key": API_KEY
    }
  })
  .then(respone => respone.json())
  .then(data => {
    const abilityStat = document.querySelector(".ability-list");
    let detailData = data.ability_info;
    abilityStat.innerHTML = `
      <li>${detailData[0].ability_no}. <strong>[${detailData[0].ability_grade}]</strong>${detailData[0].ability_value}</li>
      <li>${detailData[1].ability_no}. <strong>[${detailData[1].ability_grade}]</strong>${detailData[1].ability_value}</li>
      <li>${detailData[2].ability_no}. <strong>[${detailData[2].ability_grade}]</strong>${detailData[2].ability_value}</li>
    `
  })
}

// 장비 조회
function eqip(ocid) {
  const urlString = `https://open.api.nexon.com/maplestory/v1/character/item-equipment?ocid=${ocid}&date=${baseDate()}`;
  fetch(urlString, {
    headers:{
      "x-nxopen-api-key": API_KEY
    }
  })
  .then(respone => respone.json())
  .then(data => {
    let detailData = data.item_equipment;
    const equipTable = document.querySelector(".item-equipment-table");
    equipTable.innerHTML = `
      <tr>
        <td class="useItem" id="6"><img src="${detailData[6].item_icon}" alt="반지1"></td>
        <td></td>
        <td class="useItem" id="0"><img src="${detailData[0].item_icon}" alt="모자"></td>
        <td></td>
        <td class="useItem" id="21"><img src="${detailData[21].item_icon}" alt="엠블렘"></td>
      </tr>
      <tr>
        <td class="useItem" id="7"><img src="${detailData[7].item_icon}" alt="반지2"></td>
        <td class="useItem" id="10"><img src="${detailData[10].item_icon}" alt="목걸이1"></td>
        <td class="useItem" id="12"><img src="${detailData[12].item_icon}" alt="얼굴장식"></td>
        <td></td>
        <td class="useItem" id="16"><img src="${detailData[16].item_icon}" alt="뱃지"></td>
      </tr>
      <tr>
        <td class="useItem" id="8"><img src="${detailData[8].item_icon}" alt="반지3"></td>
        <td class="useItem" id="11"><img src="${detailData[11].item_icon}" alt="목걸이2"></td>
        <td class="useItem" id="13"><img src="${detailData[13].item_icon}" alt="눈 장식"></td>
        <td class="useItem" id="14"><img src="${detailData[14].item_icon}" alt="귀고리"></td>
        <td class="useItem" id="18"><img src="${detailData[18].item_icon}" alt="훈장"></td>
      </tr>
      <tr>
        <td class="useItem" id="9"><img src="${detailData[9].item_icon}" alt="반지4"></td>
        <td class="useItem" id="19"><img src="${detailData[19].item_icon}" alt="무기"></td>
        <td class="useItem" id="1"><img src="${detailData[1].item_icon}" alt="상의"></td>
        <td class="useItem" id="15"><img src="${detailData[15].item_icon}" alt="어깨장식"></td>
        <td class="useItem" id="20"><img src="${detailData[20].item_icon}" alt="보조무기"></td>
      </tr>
      <tr>
        <td class="useItem" id="22"><img src="${detailData[22].item_icon}" alt="포켓장비"></td>
        <td class="useItem" id="17"><img src="${detailData[17].item_icon}" alt="벨트"></td>
        <td class="useItem" id="2"><img src="${detailData[2].item_icon}" alt="하의"></td>
        <td class="useItem" id="4"><img src="${detailData[4].item_icon}" alt="장갑"></td>
        <td class="useItem" id="3"><img src="${detailData[3].item_icon}" alt="망토"></td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td class="useItem" id="5"><img src="${detailData[5].item_icon}" alt="신발"></td>
        <td></td>
        <td class="useItem" id="23"><img src="${detailData[23].item_icon}" alt="안드로이드 하트"></td>
      </tr>
    `
    // 장비 정보 확인창
    const equipItem = document.querySelectorAll(".useItem");

    equipItem.forEach((item) => {
      item.addEventListener("click",() => {
        equipItemStatBase(detailData,item)
        document.querySelector(".item-equipment-stat-check").style.display = "none";
        eqipStatBase.style.display = "block"
      })
    })
  })
}

// 장비 상세 정보
function equipItemStatBase(data,item) {
  console.log(data[item.id])
  const itemEquipmentStat = document.querySelector(".item-equipment-stat-base")
  itemEquipmentStat.innerHTML = `
    <li class="eq-name">
      <span>${data[item.id].item_name}</span>
      <em class="eq-upgrade">(+${data[item.id].scroll_upgrade})</em>
    </li>
    <ul class="item-equipment-stat-base-depth2">
      <li class="eq-starforce">
        스타포스 : ${data[item.id].starforce}
        <span class="material-symbols-outlined">kid_star</span>
      </li>
      <li>STR : 
        <span class="eq-value">${data[item.id].item_total_option.str}</span>
        (<em>${data[item.id].item_base_option.str}</em>
        +<strong>${data[item.id].item_add_option.str}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.str}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.str}</span>)
      </li>
      <li>DEX : 
        <span class="eq-value">${data[item.id].item_total_option.dex}</span>
        (<em>${data[item.id].item_base_option.dex}</em>
        +<strong>${data[item.id].item_add_option.dex}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.dex}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.dex}</span>)
      </li>
      <li>INT : 
        <span class="eq-value">${data[item.id].item_total_option.int}</span>
        (<em>${data[item.id].item_base_option.int}</em>
        +<strong>${data[item.id].item_add_option.int}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.int}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.int}</span>)
      </li>
      <li>LUK : 
        <span class="eq-value">${data[item.id].item_total_option.luk}</span>
        (<em>${data[item.id].item_base_option.luk}</em>
        +<strong>${data[item.id].item_add_option.luk}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.luk}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.luk}</span>)
      </li>
      <li>최대HP : 
        <span class="eq-value">${data[item.id].item_total_option.max_hp}</span>
        (<em>${data[item.id].item_base_option.max_hp}</em>
        +<strong>${data[item.id].item_add_option.max_hp}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.max_hp}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.max_hp}</span>)
      </li>
      <li>최대MP : 
        <span class="eq-value">${data[item.id].item_total_option.max_mp}</span>
        (<em>${data[item.id].item_base_option.max_mp}</em>
        +<strong>${data[item.id].item_add_option.max_mp}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.max_mp}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.max_mp}</span>)
      </li>
      <li>공격력 : 
        <span class="eq-value">${data[item.id].item_total_option.attack_power}</span>
        (<em>${data[item.id].item_base_option.attack_power}</em>
        +<strong>${data[item.id].item_add_option.attack_power}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.attack_power}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.attack_power}</span>)
      </li>
      <li>마력 : 
        <span class="eq-value">${data[item.id].item_total_option.magic_power}</span>
        (<em>${data[item.id].item_base_option.magic_power}</em>
        +<strong>${data[item.id].item_add_option.magic_power}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.magic_power}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.magic_power}</span>)
      </li>
      <li>방어력 : 
        <span class="eq-value">${data[item.id].item_total_option.armor}</span>
        (<em>${data[item.id].item_base_option.armor}</em>
        +<strong>${data[item.id].item_add_option.armor}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.armor}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.armor}</span>)
      </li>
      <li>이동속도 : 
        <span class="eq-value">${data[item.id].item_total_option.speed}</span>
        (<em>${data[item.id].item_base_option.speed}</em>
        +<strong>${data[item.id].item_add_option.speed}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.speed}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.speed}</span>)
      </li>
      <li>점프력 : 
        <span class="eq-value">${data[item.id].item_total_option.jump}</span>
        (<em>${data[item.id].item_base_option.jump}</em>
        +<strong>${data[item.id].item_add_option.jump}</strong>
        +<span class="eq-etcValue">${data[item.id].item_etc_option.jump}</span>
        +<span class="eq-starforceStat">${data[item.id].item_starforce_option.jump}</span>)
      </li>
      <li>올스텟 : 
        <span class="eq-value">${data[item.id].item_total_option.all_stat}</span>%
        (<em>${data[item.id].item_base_option.all_stat}</em>
        +<strong>${data[item.id].item_add_option.all_stat}</strong>)
      </li>
      <li>보스몬스터 공격시 데미지 : 
        <span class="eq-value">${data[item.id].item_total_option.boss_damage}</span>%
        (<em>${data[item.id].item_base_option.boss_damage}</em>
        +<strong>${data[item.id].item_add_option.boss_damage}</strong>)
      </li>
      <li>방어율 무시 :  
        <span class="eq-value">${data[item.id].item_total_option.ignore_monster_armor}</span>%
        (<em>${data[item.id].item_base_option.ignore_monster_armor}</em>)
      </li>
      <li>데미지 : 
        <span class="eq-value">${data[item.id].item_total_option.damage}%</span>
        (<strong>${data[item.id].item_add_option.damage}</strong>)
      </li>
      <li>업그레이드 가능 횟수 : <span>${data[item.id].scroll_upgradeable_count}</span></li>
      <li>황금 망치 적용 유무 : <span class="eq-value">${data[item.id].golden_hammer_flag}</span></li>
    </ul>
    <li class="open-potential">
    <p>잠재 능력 <span class="material-symbols-outlined dropDown">arrow_drop_down</span></p>
      <div class="potential-wrap">
        <strong>잠재 옵션[${data[item.id].potential_option_grade}]</strong>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <strong>에디셔널 잠재 옵션[${data[item.id].additional_potential_option_grade}]</strong>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
      </div>
    </li>
      `
  // 값이 0인 능력치는 표시X
  const equipValues = document.querySelectorAll(".eq-value")
  for (const equipValue of equipValues) {
    if(equipValue.textContent == 0){
      equipValue.parentNode.style.display = "none"
    }
  }
  // 잠재능력창 열기,닫기
  document.querySelector(".open-potential > p").addEventListener("click", () => {
    const arrowInPotentail = document.querySelector(".dropDown");
    if(arrowInPotentail.style.transform =="rotate(180deg)"){
      arrowInPotentail.style.transform = "rotate(0deg)"
    }
    else {
      arrowInPotentail.style.transform ="rotate(180deg)"
    }
    if(eqipStatBase.style.height == "500px"){
      eqipStatBase.style.height = "380px"
    } else {
      eqipStatBase.style.height = "500px"
    }
  })
  // 잠재능력치가 없다면 표시 X

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