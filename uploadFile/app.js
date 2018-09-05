var Koa = require("koa");
var views = require("koa-views");
var path = require("path");
var static = require("koa-static");

var app = new Koa();


var viewPath = path.join(__dirname, "views");

/*静态文件*/
app.use(static(path.join(__dirname,"public")));

/*视图*/
app.use(views(viewPath, {
    extension: "ejs"
}))

var Index = require("./routes");

app.use(Index.routes(), Index.allowedMethods());

app.listen(3001, () => {
    console.log("server is running!");
})