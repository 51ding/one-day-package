function isInRange(number, min, max) {
    console.log(number);
    return number >= min && number <= max
}

function isHasChinese(val){
    var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
    return reg.test(val);
}

console.log(isHasChinese("111"));
