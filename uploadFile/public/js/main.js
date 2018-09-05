document.getElementById("upload").onclick = function () {
    //手动构建XMLHttpRquest
    //发送表单数据
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        alert("x");
    })

    xhr.addEventListener("error", function () {
        alert("异常了！");
    })

    var data = {name: "xyz", age: 12, test: "张三"};
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];
    for (name in data) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    xhr.open('POST', '/OK');
    //表单提交
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(urlEncodedData);

    //向FormData对象中添加数据
    var formData = new FormData();
}

document.getElementById("btnfileUpload").onclick = function () {
    var form = document.getElementById("fileUpload");
    var formData = new FormData(form);

    formData.onprogress=function(){
        console.log("x");
    }
    formData.onreadystatechange=function () {
        console.log(formData);
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        console.log(xhr.readyState);
    }

    console.log(formData.entries());
    xhr.open("POST","/upload");
    xhr.send(formData);
}

document.getElementById("jsonxhr").onclick=function () {
    var xhr=new XMLHttpRequest();
    var obj={
        name:"张三",
        age:12,
    }
    var json=JSON.stringify(obj);
    xhr.open("POST","/json");
    xhr.setRequestHeader("Content-Type","application/json;chartset=utf-8")
    xhr.send(json);

}