#!/usr/bin/env node
var request = require("request");
var program = require("commander");
var crpyto = require("crypto");
var colors = require("colors");
var fs = require("fs");
var path = require("path");
var {stdin, stdout} = process;
var child = require("child_process");
//设置版本信息
var appConfig = {
    appKey: "3adf92f117653119",
    appSecret: "ybscJSDceGAQYI7AoWVT3f5y0wMhk6jG"
}

//支持的语言
var langulage = {
    Chinese: "zh-CHS",
    English: "EN",
    Japanase: "ja",
    //韩文
    Korean: "ko",
    //法文
    French: "fr",
    //俄文
    Russian: "ru",
    //葡萄牙文
    Portuguese: "pt",
    //西班牙文
    Spanish: "es",
    //越南文
    Vietnamese: "vi"
}


//翻译接口
function translate(options, callback) {
    var url = "https://openapi.youdao.com/api?";
    var body = {
        q: encodeURI(options.words),
        from: options.from,
        to: options.to,
        appKey: appConfig.appKey,
        salt: options.salt,
        sign: createSign(options)
    }
    var queryString = "";
    Object.keys(body).forEach(key => {
        queryString += `${key}=${body[key]}&`
    });
    request.get(url + queryString.substring(0, queryString.length - 1), {json: true}, function (err, response, body) {
        if (err) return console.log(err.message);
        var defaultValue = body.translation;
        body = (!body.basic || !body.basic.explains) ? defaultValue : body.basic.explains;
        if (callback) callback(body);
    })
}


function translateFn(from, to, callback) {
    return function () {
        translate({
            from: from,
            to: to,
            salt: createSalt(),
            words: arguments[0]
        }, arguments[1])
    }
}

var E2C = translateFn(langulage.English, langulage.Chinese);
var C2E = translateFn(langulage.Chinese, langulage.English);


//生成随机数
function createSalt() {
    return Math.random().toString(36).substring(2, 15);
}

//生成签名
function createSign(options) {
    var str = [appConfig.appKey, options.words, options.salt, appConfig.appSecret].join("");
    str = crpyto.createHash("md5").update(str).digest("hex");
    return str.toUpperCase();
}


//命令解析
program
    .name("ts")
    .usage("[options] [words]")
    .version("v0.0.1", "-v,--version")
    .option('-e,--e2c <words>', '英译汉', function (words) {
        operateWords(words, "英译汉", E2C);
    })
    .option("-c,--c2e <words>", "汉译英", function (words) {
        operateWords(words, "汉译英", C2E);
    })
    .option("-s,--stat", "统计单词查询次数", function () {
        statistics();
    })
    .option("--cli", "进入命令行", function () {
        cliOperate();
    })


/*处理命令行的输入*/
function cliOperate() {
    stdin.setEncoding("utf8");
    stdin.resume();
    console.log("请输入单词或语句：".grey);
    var isSelect = false;
    var currentData;
    stdin.on("data", data => {
        data = data.replace(/\r\n/g, "");
        if (data == 0) return stdin.pause();
        if (isSelect) {
            let length = currentData.length;
            let range = length > 1 ? `1~${length}` : 1;
            var inputNumber = parseInt(data);
            if (!Number.isInteger(inputNumber) || !isInRange(inputNumber, 1, length))
                return console.log(`无效的输入,请重新输入(${range})！`.red);
            child.exec(`echo ${currentData[inputNumber - 1].trim()} | clip`, () => {
                isSelect = false;
                console.log("您的选择已经在粘贴板里，直接使用Ctrl + V 使用！");
                console.log();
                console.log("请输入单词或语句：".grey);
            });
        }
        else {
            operateWords(data, "翻译", isContainsChinese(data) ? C2E : E2C, record => {
                let length = record.length;
                let range = length > 1 ? `1~${length}` : 1;
                console.log(`请选择翻译对应的编号,请输入(${range}):`.yellow);
                currentData = record;
                isSelect = true;
            });
        }
    })
}


function operateWords(words, desc, fn, fnData) {
    readRecord("all", function (err, data) {
        if (err) return console.log(err.message.red);
        if (data.has(words)) {
            data.get(words).total += 1;
            saveRecord(data, (err) => {
                if (err) return console.log(err.message.red);
                var record = data.get(words).data;
                showData(record, desc);
                fnData && fnData(record);

            })
        }
        else {
            fn.call(null, words, function (body) {
                data.set(words, {
                    data: body,
                    total: 1
                })
                saveRecord(data, (err) => {
                    if (err) return console.log(err.message.red);
                    showData(body, desc);
                    fnData && fnData(body);
                })
            })
        }
    })

}

//查询统计
function statistics() {
    readRecord("all", function (err, data) {
        var array = bubbleSort(data);
        console.log(`-----------------统计--------------------`.green);
        console.log();
        array.forEach((item, index) => {
            console.log(`${index + 1}、单词:【${item[0]}】-查询次数:${item[1].total}`.green);
        })
        console.log();
        console.log(`-------------------------------------------`.green);
    })
}

function tongji(fn) {
    var start = Date.now();
    console.log("开始---");
    fn();
    console.log(`结束----,共耗时${Date.now() - start}ms`);
}


//冒泡排序
function bubbleSort(map) {
    var arr = [...map];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (arr[j][1].total <= arr[j + 1][1].total) {        //相邻元素两两对比
                var temp = arr[j + 1];        //元素交换
                arr[j + 1] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
}

//插入排序
function insertionSort(map) {
    var arr = [...map];
    var len = arr.length;
    var preIndex, current;
    for (var i = 1; i < len; i++) {
        preIndex = i - 1;
        current = arr[i];
        while (preIndex >= 0 && arr[preIndex][1].total > current[1].total) {
            arr[preIndex + 1] = arr[preIndex];
            preIndex--;
        }
        arr[preIndex + 1] = current;
    }
    console.log(arr);
    return arr;
}

function showData(data, title) {
    console.log(`-----------------${title}--------------------`.green);
    console.log();
    data.forEach((item, index) => {
        console.log(`   ${index + 1}、${item}`.green);
    })
    console.log();
    console.log(`-------------------------------------------`.green);
}


function readRecord(query, fn) {
    fs.readFile(path.join(__dirname, "record.json"), "utf8", function (err, data) {
        if (err) return fn(err, null);
        var map = jsonToStrMap(data);
        var result = query === "all" ? map : map.get(query.key);
        fn(null, result);
    })
}

function saveRecord(map, fn) {
    fs.writeFile(path.join(__dirname, "record.json"), strMapToJson(map), function (err) {
        if (err) return fn(err, null);
        fn(null);
    })
}


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
    for (let [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
}


//判断一个数字是否在某个范围内
function isInRange(number, min, max) {
    console.log(number);
    return number >= min && number <= max
}

//判断是否包含中文
function isContainsChinese(val) {
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    return reg.test(val);
}


program.parse(process.argv)

