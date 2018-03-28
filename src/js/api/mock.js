if (process.env.NODE_ENV !== "production") {
    Mock.setup({
        timeout: "1000~2000"
    });
    // Mock.mock("/api/activitylist", {
    //     'data': [
    //         {
    //             "id": "1",
    //             "thumbimg": "https://yhz-yun1.b0.upaiyun.com/images/web/activity/act_2016_04/list_show.jpg",
    //             "title": "活动送佣金",
    //             "description": "消费送佣金(进行中)",
    //             "activity_url": "http://www.baidu.com",
    //             "activity_status": "inactive"
    //         }
    //     ],
    //     'code': 0
    // });
    // Mock.mock("/api/lotterylist", {
    //     'data': [
    //         {
    //             "id": 1,
    //             "icon": "http://yihaozhan.cc/storage/lotterytype/March2018/HthjiKOhf8bkxdF6WN4u.png",
    //             "cat_name": "时时彩",
    //             "data": [
    //                 {
    //                     "title": "重庆时时彩",
    //                     "description": "国内最早的时时彩游戏"
    //                 },
    //                 {
    //                     "title": "天津时时彩",
    //                     "description": "国内最早的时时彩游戏"
    //                 }
    //             ]
    //         },
    //         {
    //             "id": 2,
    //             "icon": "http://yihaozhan.cc/storage/lotterytype/March2018/kq68Qo4caLBfmWgReMIf.png",
    //             "cat_name": "11选5",
    //             "data": [
    //                 {
    //                     "title": "广东11选5",
    //                     "description": "广东11选5国内最早的彩票游戏"
    //                 },
    //                 {
    //                     "title": "江苏11选5",
    //                     "description": "江苏11选5，国内最早的彩票游戏"
    //                 }
    //             ]
    //         },
    //         {
    //             "id": 3,
    //             "icon": "http://yihaozhan.cc/storage/lotterytype/March2018/o1udDNuViK4YidJxlxdj.png",
    //             "cat_name": "快三",
    //             "data": [
    //                 {
    //                     "title": "江苏快三",
    //                     "description": "江苏快三是最早的彩票游戏"
    //                 }
    //             ]
    //         },
    //         {
    //             "id": 4,
    //             "icon": "",
    //             "cat_name": "福彩，北京pk10，电子竞技快乐8，体彩",
    //             "data": [
    //                 {
    //                     "title": "香港六合彩",
    //                     "description": "香港六合彩是最早的香港彩票"
    //                 }
    //             ]
    //         }
    //     ],
    //     'code': 0
    // });
    // Mock.mock("/api/welfarelist", {
    //     'data': [
    //         {
    //             "id": 1,
    //             "thumbimg": "http://yihaozhan.cc/storage/welfare/March2018/vKvK028D6nWQDNDZ1EI7.png",
    //             "title": "公益事业1测试",
    //             "data_time": "2018-03-08",
    //             "place": "manila",
    //             "detail": "马尼拉公益事业内容测试"
    //         }
    //     ],
    //     'code': 0
    // });
    Mock.mock("/api/brandreport", {
        'data': [
            {
                "id": 1,
                "thumbimg": "http://yihaozhan.cc/storage/brand/March2018/ShbWRNoJAQVhWeNh9OSe.jpg",
                "title": "品牌报道第一篇标题",
                "description": "品牌报道描述",
                "article_url": "http://www.baidu.com"
            },
            {
                "id": 2,
                "thumbimg": "http://yihaozhan.cc/storage/brand/March2018/ShbWRNoJAQVhWeNh9OSe.jpg",
                "title": "品牌报道第一篇标题",
                "description": "品牌报道描述",
                "article_url": "http://www.baidu.com"
            }
        ],
        'code': 0
    });
    // Mock.mock("/api/associatedmedia", {
    //     'data': [
    //         {
    //             "id": 1,
    //             "thumbimg": "http://yihaozhan.cc/storage/comedia/March2018/th8aSus959c7fJSA3X7F.png",
    //             "title": "一号站",
    //             "media_link": "http://www.baidu.com"
    //         },
    //         {
    //             "id": 2,
    //             "thumbimg": "http://yihaozhan.cc/storage/comedia/March2018/th8aSus959c7fJSA3X7F.png",
    //             "title": "一号站",
    //             "media_link": "http://www.baidu.com"
    //         }
    //     ],
    //     'code': 0
    // });
}

// export default Mock;