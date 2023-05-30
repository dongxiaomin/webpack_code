// const sum = (...args) => {
//     return args.reduce(
//         (p, n) => p + n, 0
//     )() //测试报错后 SourceMap 源代码映射
// };
const sum = (...args) => {
    return args.reduce(
        (p, n) => p + n, 0
    )
};

export default sum;