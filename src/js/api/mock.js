if (process.env.NODE_ENV !== "production") {
    Mock.setup({
        timeout: "1000~2000"
    });
    Mock.mock("test.php", {
        'data': {
            'list|1-10': [{
                'id|+1': 1,
                'email': '@EMAIL'
            }]
        },
        'code': 0
    });
    Mock.mock("1.php", {
        'list|1-10': [{
            'id|+1': 1,
            'email': '@EMAIL'
        }]
    });
}

export default Mock;