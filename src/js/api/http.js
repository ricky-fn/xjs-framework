import axios from "axios"

const httpConfig = {
    loginCode: 0,
    loginCall: function () {},
    beforeSend: function () {},
    beforeResponse: function () {}
};

// const request = axios.create({
//     transformRequest: [data => {
//         config.beforeSend(data);
//         return data;
//     }],
//     transformResponse: [data => {
//         if (data.code == config.loginCode) {
//             config.loginCall();
//         }
//     }]
// });

class http {
    constructor(conf) {
        this._config = conf;
    }
    request(param, subConf) {
        subConf = Object.assign({}, this._config, subConf);

        let def = new Promise((resolve, reject) => {
            axios(Object.assign({}, {
                transformRequest: [data => {
                    subConf.beforeSend && subConf.beforeSend(data);
                    return data;
                }],
                transformResponse: [data => {
                    let obj = JSON.parse(data);
                    if (obj.code == subConf.loginCode) {
                        subConf.loginCall();
                    } else {
                        subConf.beforeResponse && subConf.beforeResponse();
                    }

                    return data;
                }]
            }, param)).then(res => {
                if (subConf.skipError) {
                    resolve(res.data);
                } else {
                    resolve(res.data.data);
                }
            }).catch(err => reject);
        });

        return def;
    }
}

export {httpConfig, http}