import axios from "axios"

const httpConfig = {
    failCode: null,
    successCode: null,
    loginCode: null,
    loginCall: null,
    beforeSend: null,
    beforeResponse: null
};

class http {
    constructor(conf) {
        this._config = Object.assign({}, httpConfig, conf);
    }
    request(param, subConf) {
        subConf = Object.assign({}, this._config, subConf);

        let def = new Promise((resolve, reject) => {
            axios(Object.assign({}, {
                // transformRequest: [(data, header) => {
                //     subConf.beforeSend && subConf.beforeSend(data);
                //     debugger;
                //     return JSON.stringify(data);
                // }],
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
                let data = JSON.parse(res.data);
                if (subConf.skipError) {
                    resolve(data);
                } else if (subConf.failCode == data.code) {
                    reject(data);
                } else {
                    resolve(data.data);
                }
            }).catch(err => reject);
        });

        return def;
    }
}

export {httpConfig, http}