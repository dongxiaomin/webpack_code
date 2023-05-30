import count from "./js/count";
import sum from "./js/sum";
import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./sass/index.scss";
import "./stylus/index.styl";
import "./css/iconfont.css";

console.log(count(2, 1));
console.log(sum(2, 1, 3, 4));

// const  xx = count(2, 1);
// console.log(xx)

// 判断是否支持HMR功能
if (module.hot) {
    module.hot.accept("./js/count.js")
}