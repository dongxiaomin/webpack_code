const sum = (...args) => {
    return args.reduce(
        (p, n) => p + n, 0
    )
};

export default sum;