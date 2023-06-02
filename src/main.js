import count from "./js/count";
import sum from "./js/sum";
import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./sass/index.scss";
import "./stylus/index.styl";
import "./css/iconfont.css";
// import {  } from "./js/test";

console.log(count(2, 1));
console.log(sum(2, 1, 3, 4));

// 判断是否支持HMR功能
if (module.hot) {
    module.hot.accept("./js/count.js")
}

document.getElementById("btn").onclick = function () {
    import('./js/test').then(({ test }) => {
        console.log(test(2, 1))
    })
    // import('./js/count.js').then((res) => {
    //     console.log(res.default(2, 1));
    // })

    // import('./js/count.js')
    //     .then((res) => {
    //         // console.log("模块加载成功",count(2, 1));
    //         console.log( "模块加载成功",res);
    //         console.log( "模块加载成功",res.default(2, 1));
    //     })
    //     .catch(( error) => {
    //         console.log("模块加载失败", error);
    //     });

};