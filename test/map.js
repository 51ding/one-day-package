var fs=require("fs");
var map=new Map();

map.set("a",["1","3","4","5"]);
map.set("c",["1","3","4","5"]);
map.set("n",["1","3","4","5"]);
map.set("d",["1","3","4","5"]);
map.set("1",["1","3","4","5"]);
map.set("2",["1","3","4","5"]);
// fs.writeFile("a.txt",strMapToJson(map),function (err) {
//
// });

fs.readFile("a.txt","utf8",function (err,data) {
    var newMap=jsonToStrMap(data);

    console.log(newMap.get("1"));
})


function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}

function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}

function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
}

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        obj[k] = v;
    }
    return obj;
}

