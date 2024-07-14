const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const errorHandler = require("./helpers/errorHandler");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user.controllers");
var booksRouter = require("./routes/book.controllers");
var ordersRouter = require("./routes/order.controllers");
var dashboardRouter = require("./routes/dashboard.controller");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/orders", ordersRouter);
app.use("/dashboard", dashboardRouter);

// catch 404 and forward to error handler
app.use(errorHandler);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(5000, () => console.log(`Server is listening on PORT: 5000`));
module.exports = app;
