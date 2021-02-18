// Tableからデータ抜き取り。連想配列に。
// {気温: [10, 11, 10]}みたいな
function getData(table) {
  let res = {};
  let rowCount = table.rows.length;
  let colCount = table.rows[0].cells.length;

  for (let j = 0; j < colCount; j++) {
    let vals = []
    for (let i = 2; i < rowCount; i++) {
      vals.push(parseFloat(table.rows[i].cells[j].textContent));
    }
    res[table.rows[0].cells[j].textContent] = vals;
  }
  return res;
}

// 軸用に気温の最大値最小値を取得
function getMinMax(arr) {
  let minT = 100.0, maxT = -100;
  for (let t of arr) {
    minT = t < minT ? t : minT;
    maxT = t > maxT ? t : maxT;
  }
  return { minT, maxT }
}


window.onload = function () {
  /**
   * グラフ作成
   */

  // canvasタグ
  let mainCanvas = document.createElement("canvas");
  mainCanvas.id = 'myChart';
  let deepTable = document.getElementById('tbl_list');
  deepTable.insertAdjacentElement('beforebegin', mainCanvas);

  // 薄いほうのdocument取得
  let paleTable;
  let xhr = new XMLHttpRequest();

  let method = 'GET';
  let target;
  if (document.URL.match('today')) {
    target = document.URL.replace('today', 'yesterday');
    dayOfLabelDeep = '今日';
    dayOfLabelPale = '昨日';
  } else {
    target = document.URL.replace('yesterday', 'today');
    dayOfLabelDeep = '昨日';
    dayOfLabelPale = '今日';
  }
  let async = true;

  xhr.open(method, target, async);

  xhr.responseType = 'document';
  xhr.onload = function (e) {
    if (this.status === 200) {
      paleTable = this.responseXML.getElementById('tbl_list');
    } else {
      console.error('unexpected status code: ' + this.status);
    };
  }
  xhr.addEventListener('load', (e) => callback());
  xhr.send();

  function callback() {
    let deepData = getData(deepTable);
    let paleData = getData(paleTable);

    // Dataset作成
    let Dataset = [{
      label: `降水量(${dayOfLabelDeep})`,
      data: deepData.降水量,
      borderColor: "rgba(0,0,255,1)",
      backgroundColor: "rgba(0,0,255,0.5)",
      yAxisID: "y-axis-2"
    }];
    let YAxes = [{
      id: "y-axis-2",
      position: "right",
      ticks: {
        suggestedMax: 10,
        min: 0,
        stepSize: 5,
        callback: function (value, index, values) {
          return value + 'mm'
        }
      },
      gridLines: {
        drawOnChartArea: false,
      }
    }];
    if ('気温' in deepData) {
      // pushでなくてunshiftなのはグラフの重なり順による
      Dataset.unshift({
        label: `気温(${dayOfLabelDeep})`,
        type: "line",
        data: deepData.気温,
        borderColor: "rgba(255,50,60,0.9)",
        backgroundColor: "rgba(0,0,0,0)",
        yAxisID: "y-axis-1"
      },
        {
          label: `気温(${dayOfLabelPale})`,
          type: "line",
          data: paleData.気温,
          borderColor: "rgba(255,50,60,0.4)",
          backgroundColor: "rgba(0,0,0,0)",
          yAxisID: "y-axis-1"
        });
      let { minT, maxT } = getMinMax(deepData.気温.concat(paleData.気温));
      YAxes.unshift({
        id: "y-axis-1",
        ticks: {
          suggestedMax: maxT,
          suggestedMin: minT,
          stepSize: 5,
          callback: function (value, index, values) {
            return value + '℃'
          }
        }
      });
    }

    // グラフ表示
    let ctx = document.getElementById("myChart").getContext("2d");

    let myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: deepData.時刻,
        datasets: Dataset
      },
      options: {
        title: {
          display: false,
          position: 'bottom',
          text: 'アメダスグラフ'
        },
        legend: {
          display: true,
          position: 'bottom'
        },
        scales: {
          yAxes: YAxes
        },
      }
    });
  };


  /**
   * 過去の気象データ検索へリンク
   */

  // 地点情報
  let amedasID = document.URL.split('-')[1].split('.')[0];
  let prec_no = ameTable["prec_no"][amedasID];
  let block_no = ameTable["block_no"][amedasID];

  // 日付情報（昨日の）
  let kinou = new Date();  // 今日
  kinou.setDate(kinou.getDate() - 1) // 昨日
  let year = kinou.getFullYear();
  let month = kinou.getMonth() + 1;
  let day = kinou.getDate();

  // リンクを追加
  let kakoA = document.createElement('a');
  kakoA.href = `https://www.data.jma.go.jp/obd/stats/etrn/index.php?prec_no=${prec_no}&block_no=${block_no}&year=${year}&month=${month}&day=${day}&view=`;
  kakoA.target = "_blank"
  kakoA.innerText = '過去の観測データ';
  kakoA.classList.add('kako');
  let td_subtitle = document.getElementsByClassName('td_subtitle')[0];
  td_subtitle.appendChild(kakoA);
  // 整形
  td_subtitle.children[0].insertAdjacentElement(
    "afterbegin", document.createElement('br'));
};