var Router = require("koa-router");
var formidable = require("formidable");
var router = new Router();
var fs=require("fs");
var path=require("path");

console.log(require("os").tmpdir() )
router.get("/", async ctx => {
    await ctx.render("index");
})

router.post("/ok", async ctx => {
    var data = await getData.call(ctx);
    console.log(data);
    ctx.body = "nimeide";
})

router.post("/upload", async ctx => {
    var data = await requestParser.call(ctx);
    // console.log(data);
    ctx.body = "nimeide";
})

router.post("/json", async ctx => {
    ctx.body = "chenggon!";
    var data = await getData.call(ctx);
    ctx.body = data.toString();
})


function getData() {
    return new Promise((resolve, reject) => {
        var buffers = [];
        this.req.on("data", function (chunk) {
            buffers.push(chunk);
        })

        this.req.on("end", function () {
            buffers = Buffer.concat(buffers);
            console.log(buffers.length);
            resolve(buffers);
        })
    })
}

function requestParser() {
    return new Promise((resolve, reject) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = require("path").join(__dirname,"../");
        form.keepExtensions=true;
        form.parse(this.req, function (err, fields, files) {
            if (err) return reject(err);
            var data = {
                fields: fields,
                files: files
            };
            resolve(data);
        })


        form.onPart = function(part) {
            if(part.filename){
                console.log(part);
                part.pipe(fs.createWriteStream(path.join(__dirname,"a.jpeg")));
            }
        }

        form.on('progress', function(bytesReceived, bytesExpected) {
            console.log(bytesReceived);
        });

    })
}

function uploadFile(){

}


module.exports = router;