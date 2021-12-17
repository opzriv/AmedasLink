const CLASS_NAME = 'kako-link';

const observedNode = document.getElementById('amd-table');
const config = { attribute: true, childList: true, subtree: true };

const showKakoLink = () => {
  // 地点情報
  let amdno = Number.parseInt(document.URL.match(/amdno=([0-9]+)/)[1]);
  let prec_no = ameTable["prec_no"][amdno];
  let block_no = ameTable["block_no"][amdno];

  // 日付情報（昨日の）
  let kinou = new Date();  // 今日
  kinou.setDate(kinou.getDate() - 1) // 昨日
  let year = kinou.getFullYear();
  let month = kinou.getMonth() + 1;
  let day = kinou.getDate();

  // リンクを追加
  let kakoLink = document.createElement('a');
  kakoLink.className = CLASS_NAME;
  kakoLink.href = `https://www.data.jma.go.jp/obd/stats/etrn/index.php?prec_no=${prec_no}&block_no=${block_no}&year=${year}&month=${month}&day=${day}&view=`;
  kakoLink.target = "_blank"
  kakoLink.innerText = '過去の観測データ';

  let targetElm = document.getElementById("amd-controller");
  targetElm.insertAdjacentElement("afterend", kakoLink);
}

const removeKakoLink = () => {
  kakoLinks = document.getElementsByClassName(CLASS_NAME);
  while (kakoLinks.length > 0) {
    kakoLinks[0].parentNode.removeChild(kakoLinks[0]);
  }
}

const callback = (mutationsList, observer) => {
  removeKakoLink();
  showKakoLink();
}

const observer = new MutationObserver(callback);
observer.observe(observedNode, config);
