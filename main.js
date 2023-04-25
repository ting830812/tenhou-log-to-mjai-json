var result_template = {
  "rule": {
    "aka": 1
  },
  "name":["", "", "", ""],
  "log":[[
      // [<局>, <本場>, <供托棒>],
      [],
      // [<東家分>, <南家分>, <西家分>, <北家分>],
      [],
      // [<寶>],
      [],
      // [<裏寶>],
      [],
      // [<東家起手配牌> * 13],
      [],
      // [<東家進張> * n],
      [],
      // [<東家捨牌> * n],
      [],
      // [<南家起手配牌> * 13],
      [],
      // [<南家進張> * n],
      [],
      // [<南家捨牌> * n],
      [],
      // [<西家起手配牌> * 13],
      [],
      // [<西家進張> * n],
      [],
      // [<西家捨牌> * n],
      [],
      // [<北家起手配牌> * 13],
      [],
      // [<北家進張> * n],
      [],
      // [<北家捨牌> * n],
      [],
      // ["和了"/"流局", ,
      ["",
        // [<東家加減分>, <南家加減分>, <西家加減分>, <北家加減分>],
        [0,0,0,0],
        // [who, target, delta_score??, 點數, 役種]
        [0,0,0,""],
      ],
      // []
  ]],
};

function paiCodeTenhouToChar(x) {
  var hai = ["一", "二", "三", "四", "五", "六", "七", "八", "九", // 萬子
             "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", // 筒子
             "1", "2", "3", "4", "5", "6", "7", "8", "9", // 索子
             "東", "南", "西", "北", "白", "發", "中"]
  if (parseInt(x) == 16)
    return "赤五";
  else if (parseInt(x) == 52)
    return "赤⑤";
  else if (parseInt(x) == 88)
    return "赤5";
  else
    return hai[parseInt(x) >> 2]
}

function paiCodeTenhouToMjai(x) {
  var mjai_table = [11, 12, 13, 14, 15, 16, 17, 18, 19, // 萬子
                    21, 22, 23, 24, 25, 26, 27, 28, 29, // 筒子
                    31, 32, 33, 34, 35, 36, 37, 38, 39, // 索子
                    41, 42, 43, 44, 45, 46, 47 // 字牌
                    ]
  if (parseInt(x) == 16)
    return 51;
  else if (parseInt(x) == 52)
    return 52;
  else if (parseInt(x) == 88)
    return 53;
  else
    return mjai_table[(parseInt(x) >> 2)]
}

function copy(id) {
 navigator.clipboard.writeText(document.getElementById("result" + id).innerHTML)
  .then(() => {
    alert("Copied");
  });
}

function submit() {
  var url = "https://tenhou.net/0/log/?" + document.getElementById("inputTenhouLogUrl").value;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = 'document';
  request.overrideMimeType('text/xml');
  request.onload = function () {
    if (request.readyState === request.DONE) {
      if (request.status === 200) {
        var xml = request.responseXML;
        // console.log(xml);

        var names = xml.getElementsByTagName("UN")[0];
        result_template["name"][0] = decodeURI(names.getAttribute("n0"));
        result_template["name"][1] = decodeURI(names.getAttribute("n1"));
        result_template["name"][2] = decodeURI(names.getAttribute("n2"));
        result_template["name"][3] = decodeURI(names.getAttribute("n3"));

        var kyokus = xml.getElementsByTagName("INIT");
        var results = [...Array(kyokus.length)];

        for (var i = 0; i < kyokus.length; i++) {
          // if (i != 6) continue;
          var kyoku = kyokus[i];
          console.log(kyoku);
          results[i] = JSON.parse(JSON.stringify(result_template));
          results[i]["log"][0][0] = kyoku.getAttribute("seed").split(",").slice(0,3).map(x => parseInt(x));
          results[i]["log"][0][1] = kyoku.getAttribute("ten").split(",").slice(0,4).map(x => parseInt(x + "00"));
          results[i]["log"][0][2] = kyoku.getAttribute("seed").split(",").slice(5,6).map(x => parseInt(paiCodeTenhouToMjai(x)));

          // 配牌
          results[i]["log"][0][4] = kyoku.getAttribute("hai0").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results[i]["log"][0][7] = kyoku.getAttribute("hai1").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results[i]["log"][0][10] = kyoku.getAttribute("hai2").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results[i]["log"][0][13] = kyoku.getAttribute("hai3").split(",").map(x => paiCodeTenhouToMjai(x)).sort();

          var curr = kyoku.nextSibling;
          while(curr.tagName != "AGARI" && curr.tagName != "RYUUKYOKU") {
            if (curr.tagName == "DORA") {
              results[i]["log"][0][2].push(paiCodeTenhouToMjai(curr.getAttribute("hai")));
            }
            else if (curr.tagName == "N") {
              // http://tenhou.net/img/tehai.js
              var who = parseInt(curr.getAttribute("who"));
              var m = parseInt(curr.getAttribute("m"));
              
              // 順子 c
              if (m & (1 << 2)) {
                var t = (m & 0xFC00) >> 10;
                var r = t % 3;
                t = parseInt(t / 3);
                t = parseInt(t / 7) * 9 + (t % 7);
                t *= 4;
                var h = [t + 4 * 0 + ((m & 0x0018) >> 3), t + 4 * 1+((m & 0x0060) >> 5), t + 4 * 2 + ((m & 0x0180) >> 7)];
                switch(r) {
                  case 1:
                      h.unshift(h.splice(1,1)[0]);
                      break;
                  case 2:
                      h.unshift(h.splice(2,1)[0]);
                      break;
                }
                results[i]["log"][0][5+who*3].push("c" + paiCodeTenhouToMjai(h[0]) + paiCodeTenhouToMjai(h[1]) + paiCodeTenhouToMjai(h[2]));
              }
              // 刻子 p
              else if (m & (1 << 3)) {
                var t = (m & 0xFE00) >> 9;
                t = parseInt(t/3);
                t *= 4;
                var from_who = m & 3;
                switch(from_who) {
                  case 1:
                    // 下家
                    results[i]["log"][0][5+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "p" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results[i]["log"][0][5+who*3].push(paiCodeTenhouToMjai(t) + "p" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results[i]["log"][0][5+who*3].push("p" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                }
              }
              // 加槓 k
              else if (m & 1 << 4) {
                var t = (m & 0xFE00) >> 9;
                t = parseInt(t / 3);
                t *= 4;
                var from_who = m & 3;
                switch(from_who) {
                  case 1:
                    // 下家
                    results[i]["log"][0][6+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results[i]["log"][0][6+who*3].push(paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results[i]["log"][0][6+who*3].push("k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                }
              }
              // 明槓 m 暗槓 a
              else {
                var t = (m & 0xFF00) >> 8;
                var from_who = m & 3;
                switch(from_who) {
                  case 0:
                    // 暗槓
                    results[i]["log"][0][6+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "a" + paiCodeTenhouToMjai(t));
                    break;
                  case 1:
                    // 下家
                    results[i]["log"][0][5+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results[i]["log"][0][5+who*3].push(paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results[i]["log"][0][5+who*3].push("k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                }
              }
            }
            else if (curr.tagName == "REACH") {
              if (curr.getAttribute("step") == "1") {
                var who = parseInt(curr.getAttribute("who"));
                curr = curr.nextSibling;
                results[i]["log"][0][6+who*3].push("r" + paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
            }
            else {
              // 東家進張
              if (curr.tagName[0] == "T") {
                results[i]["log"][0][5].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 南家進張
              else if (curr.tagName[0] == "U") {
                results[i]["log"][0][8].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 西家進張
              else if (curr.tagName[0] == "V") {
                results[i]["log"][0][11].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 北家進張
              else if (curr.tagName[0] == "W") {
                results[i]["log"][0][14].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }

              // 東家捨牌
              else if (curr.tagName[0] == "D") {
                results[i]["log"][0][6].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 南家捨牌
              else if (curr.tagName[0] == "E") {
                results[i]["log"][0][9].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 西家捨牌
              else if (curr.tagName[0] == "F") {
                results[i]["log"][0][12].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 北家捨牌
              else if (curr.tagName[0] == "G") {
                results[i]["log"][0][15].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
            }
            curr = curr.nextSibling;
          } 


          var round = "東";
          if (parseInt(kyoku.getAttribute("seed").split(",")[0]) > 3)
            round = "南";

          document.getElementById("result").innerHTML += "<div>";
          document.getElementById("result").innerHTML += "<h2>" + round + "" + (parseInt(kyoku.getAttribute("seed").split(",")[0]) % 4 + 1) + "局" + kyoku.getAttribute("seed").split(",")[1] + "本場</h2>";
          document.getElementById("result").innerHTML += "<button type='button' onclick='copy(" + i + ")' class='btn btn-secondary'>Copy</button>";
          document.getElementById("result").innerHTML += "</div>";

          document.getElementById("result").innerHTML += "<div id='result" + i + "'>" + JSON.stringify(results[i]) + "</div><hr>";

        }
      }
    }
  };
  request.send(null);
}
