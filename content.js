// Tableからデータ抜き取り。連想配列に。
function getData(table) {
    var keys = [];
    for (var key of table.rows[0].cells) keys.push(key.textContent);
    
    var data = {};
    for (var key of keys) data[key] = [];

    var rowCount = table.rows.length;
    for (var i=2; i<rowCount; i++) {
        var tr = table.rows[i];
        for (var j=0; j<keys.length; j++) {
            var val = parseFloat(tr.cells[j].textContent);
            data[keys[j]].push(val);
        }
    }
    return data;
}

// 軸用に気温の最大値最小値を取得
function getMinMax(arr) {
    var minT=100.0, maxT=-100;
    for (var t of arr) {
        minT = t < minT ? t : minT;
        maxT = t > maxT ? t : maxT;
    }
    return {minT, maxT}
}


window.onload = function() {
    /**
     * グラフ作成
     */

    // canvasタグ
    var mainCanvas = document.createElement("canvas");
    mainCanvas.id = 'myChart';
    var deepTable = document.getElementById('tbl_list');
    deepTable.insertAdjacentElement('beforebegin', mainCanvas);

    // 薄いほうのdocument取得
    var paleTable;
    var xhr = new XMLHttpRequest();

    var method = 'GET';
    var target;
    if (document.URL.match('today')) {
        target = document.URL.replace('today', 'yesterday');
        dayOfLabelDeep = '今日';
        dayOfLabelPale = '昨日';
    } else {
        target = document.URL.replace('yesterday', 'today');
        dayOfLabelDeep = '昨日';
        dayOfLabelPale = '今日';
    }
    var async = true;
    
    xhr.open(method, target, async);
    
    xhr.responseType = 'document';
    xhr.onload = function(e) {
      if (this.status === 200) {
        paleTable = this.responseXML.getElementById('tbl_list');
      }else{
        console.error('unexpected status code: '+this.status);
      };
    }
    xhr.addEventListener('load', (e)=> callback());
    xhr.send();

    function callback() {
        var deepData = getData(deepTable);
        var paleData = getData(paleTable);

        // Dataset作成
        var Dataset = [{
            label: `降水量(${dayOfLabelDeep})`,
            data: deepData.降水量,
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,255,0.5)",
            yAxisID: "y-axis-2"
        }];
        var YAxes = [{
            id: "y-axis-2",
            position: "right",
            ticks: {
            suggestedMax: 10,
            min: 0,
            stepSize: 5,
            callback: function(value, index, values){
                return  value +  'mm'
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
            var {minT, maxT} = getMinMax(deepData.気温.concat(paleData.気温));
            YAxes.unshift({
                id: "y-axis-1",
                ticks: {
                suggestedMax: maxT,
                suggestedMin: minT,
                stepSize: 5,
                callback: function(value, index, values){
                    return  value +  '℃'
                }
                }
            });
        }
    
        // グラフ表示
        var ctx = document.getElementById("myChart").getContext("2d");
        
        var myChart = new Chart(ctx, {
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
    var amedasID = document.URL.split('-')[1].split('.')[0];
    var prec_no = ameTable["prec_no"][amedasID];
    var block_no = ameTable["block_no"][amedasID];

    // 日付情報（昨日の）
    var kyou = new Date();
    var year = kyou.getFullYear();
    var month = kyou.getMonth() + 1;
    var day = kyou.getDate() - 1;

    // リンクを追加
    var kakoA = document.createElement('a');
    kakoA.href = `https://www.data.jma.go.jp/obd/stats/etrn/index.php?prec_no=${prec_no}&block_no=${block_no}&year=${year}&month=${month}&day=${day}&view=`;
    kakoA.target = "_blank"
    kakoA.innerText = '過去の観測データ';
    kakoA.classList.add('kako');
    var td_subtitle = document.getElementsByClassName('td_subtitle')[0];
    td_subtitle.appendChild(kakoA);
    // 整形
    td_subtitle.children[0].insertAdjacentElement(
        "afterbegin", document.createElement('br'));
};