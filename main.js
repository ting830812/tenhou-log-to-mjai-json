var results = {
  "rule": {
    "aka": 1
  },
  "name":["Aさん", "Bさん", "Cさん", "Dさん"],
  "log":[]
}

var result_template = [
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
      // [who, from_who, delta_score??, 點數, 役種]
      [0,0,0,"0符0飜0点", ""],
    ],
    // []
];

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
 navigator.clipboard.writeText(document.getElementById("kyoku" + id).innerHTML)
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
        results["name"][0] = decodeURI(names.getAttribute("n0"));
        results["name"][1] = decodeURI(names.getAttribute("n1"));
        results["name"][2] = decodeURI(names.getAttribute("n2"));
        results["name"][3] = decodeURI(names.getAttribute("n3"));

        var kyokus = xml.getElementsByTagName("INIT");
        results["log"] = [...Array(kyokus.length)];

        for (var i = 0; i < kyokus.length; i++) {
          // if (i != 6) continue;
          var kyoku = kyokus[i];
          console.log(kyoku);
          results["log"][i] = JSON.parse(JSON.stringify(result_template));
          results["log"][i][0] = kyoku.getAttribute("seed").split(",").slice(0,3).map(x => parseInt(x));
          results["log"][i][1] = kyoku.getAttribute("ten").split(",").slice(0,4).map(x => parseInt(x + "00"));
          results["log"][i][2] = kyoku.getAttribute("seed").split(",").slice(5,6).map(x => parseInt(paiCodeTenhouToMjai(x)));

          // 配牌
          results["log"][i][4] = kyoku.getAttribute("hai0").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results["log"][i][7] = kyoku.getAttribute("hai1").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results["log"][i][10] = kyoku.getAttribute("hai2").split(",").map(x => paiCodeTenhouToMjai(x)).sort();
          results["log"][i][13] = kyoku.getAttribute("hai3").split(",").map(x => paiCodeTenhouToMjai(x)).sort();

          var curr = kyoku.nextSibling;
          while(curr.tagName != "AGARI" && curr.tagName != "RYUUKYOKU") {
            if (curr.tagName == "UN") {
              curr = curr.nextSibling;
              continue;
            }
            else if (curr.tagName == "DORA") {
              results["log"][i][2].push(paiCodeTenhouToMjai(curr.getAttribute("hai")));
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
                results["log"][i][5+who*3].push("c" + paiCodeTenhouToMjai(h[0]) + paiCodeTenhouToMjai(h[1]) + paiCodeTenhouToMjai(h[2]));
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
                    results["log"][i][5+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "p" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results["log"][i][5+who*3].push(paiCodeTenhouToMjai(t) + "p" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results["log"][i][5+who*3].push("p" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
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
                    results["log"][i][6+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results["log"][i][6+who*3].push(paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results["log"][i][6+who*3].push("k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
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
                    results["log"][i][6+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "a" + paiCodeTenhouToMjai(t));
                    break;
                  case 1:
                    // 下家
                    results["log"][i][5+who*3].push(paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 2:
                    // 對家
                    results["log"][i][5+who*3].push(paiCodeTenhouToMjai(t) + "k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                  case 3:
                    // 上家
                    results["log"][i][5+who*3].push("k" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t) + "" + paiCodeTenhouToMjai(t));
                    break;
                }
              }
            }
            else if (curr.tagName == "REACH") {
              if (curr.getAttribute("step") == "1") {
                var who = parseInt(curr.getAttribute("who"));
                curr = curr.nextSibling;
                results["log"][i][6+who*3].push("r" + paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
            }
            else {
              // 東家進張
              if (curr.tagName[0] == "T") {
                results["log"][i][5].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 南家進張
              else if (curr.tagName[0] == "U") {
                results["log"][i][8].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 西家進張
              else if (curr.tagName[0] == "V") {
                results["log"][i][11].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 北家進張
              else if (curr.tagName[0] == "W") {
                results["log"][i][14].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }

              // 東家捨牌
              else if (curr.tagName[0] == "D") {
                results["log"][i][6].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 南家捨牌
              else if (curr.tagName[0] == "E") {
                results["log"][i][9].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 西家捨牌
              else if (curr.tagName[0] == "F") {
                results["log"][i][12].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
              // 北家捨牌
              else if (curr.tagName[0] == "G") {
                results["log"][i][15].push(paiCodeTenhouToMjai(curr.tagName.substr(1)));
              }
            }
            curr = curr.nextSibling;
          } 

          // End state
          var end_result = "";
          if (curr.tagName == "AGARI") {
            results["log"][i][16][0] = "和了";
            var who = curr.getAttribute("who");
            results["log"][i][16][2][0] = parseInt(who);
            results["log"][i][16][2][2] = parseInt(who);
            var from_who = curr.getAttribute("fromWho");
            results["log"][i][16][2][1] = parseInt(from_who);
            var sc = curr.getAttribute("sc").split(",").map(x => parseInt(x + "00"));
            results["log"][i][16][1][0] = sc[1];
            results["log"][i][16][1][1] = sc[3];
            results["log"][i][16][1][2] = sc[5];
            results["log"][i][16][1][3] = sc[7];

            var ten = curr.getAttribute("ten").split(",")[1];
            if (who == from_who) {
              end_result = results["name"][who] + "ツモ " + ten + "点";
            }
            else {
              end_result = results["name"][who] + "ロン " + ten + "点, " + results["name"][from_who] + "放銃";
            }

          }

          else if (curr.tagName == "RYUUKYOKU") {
            end_result = "流局";
            results["log"][i][16][0] = "流局";
            var sc = curr.getAttribute("sc").split(",").map(x => parseInt(x + "00"));
            results["log"][i][16][1][0] = sc[1];
            results["log"][i][16][1][1] = sc[3];
            results["log"][i][16][1][2] = sc[5];
            results["log"][i][16][1][3] = sc[7];
          }


          var round = "東";
          if (parseInt(kyoku.getAttribute("seed").split(",")[0]) > 3)
            round = "南";

          var inner_html = "";
          inner_html += "<div>";
          inner_html += "<div>";
          inner_html += "<h3 style='display:inline'>" + round + "" + (parseInt(kyoku.getAttribute("seed").split(",")[0]) % 4 + 1) + "局" + kyoku.getAttribute("seed").split(",")[1] + "本場</h3>";
          inner_html += "<span> " + end_result + "</span>";
          inner_html += "</div>";
          inner_html += "<button type='button' onclick='copy(" + i + ")' class='btn btn-secondary'>Copy</button></div>";
          inner_html += "</div>";

          var tmp_result = JSON.parse(JSON.stringify(results));
          tmp_result["log"] = [tmp_result["log"][i]];
          inner_html += "<code id='kyoku" + i + "'>" + JSON.stringify(tmp_result) + "</code><hr>";

          document.getElementById("kyoku").innerHTML += inner_html;

        }

        console.log(results);

        var inner_html = "";
        inner_html += "<div><button type='button' onclick='copy(\"all\")' class='btn btn-secondary'>Copy</button></div>";
        inner_html += "<code id='kyokuall'>" + JSON.stringify(results) + "</code>";
        document.getElementById("all-kyokus").innerHTML += inner_html;

        inner_html = "";
        for (var i = 0; i < results["name"].length; i++) {
          inner_html += i + ":" + results["name"][i] + "   ";
        }
        document.getElementById("name").innerHTML += inner_html;

      }
    }
  };
  request.send(null);
}
