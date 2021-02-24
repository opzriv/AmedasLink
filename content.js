function showLinkPast() {
  // 地点情報
  let amdno = Number.parseInt(document.URL.split('&')[2].split('=')[1]);
  let prec_no = ameTable["prec_no"][amdno];
  let block_no = ameTable["block_no"][amdno];

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

  let locationEl = document.getElementById("amd-controller");
  locationEl.insertAdjacentElement("afterend", kakoA);
}

showLinkPast();