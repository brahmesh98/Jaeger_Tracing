const axios = require('axios');
import { log } from './error.utils';
const { FORMAT_HTTP_HEADERS } = require('opentracing');

/**
 * Make an API Call 
 * @param url 
 * @param payload 
 * @param auth 
 * @param span 
 * @param method 
 */
export const apiCall = async function (url, payload, auth, span, method = 'POST') {

    let apiCallSpan = global[ "tracer" ].startSpan("api-call", { childOf: span });

    try {

        let headers = {
            Accept: 'application/json;charset=UTF-8',
            authorization: auth || ""
        };

        global[ "tracer" ].inject(apiCallSpan, FORMAT_HTTP_HEADERS, headers);

        log("info", {
            msg: "Routing",
            url: url
            // payload: payload
        });

        let apiOptions = {
            url: url,
            method: method,
            headers: headers,
            responseType: 'json',
            data: payload
        };
        console.log("api call payload----", apiOptions);
        let response = await axios(apiOptions);

        apiCallSpan.finish();

        return {
            err: null,
            response: response.data,
            span: apiCallSpan
        };
    } catch (err) {

        log("error", {
            message: "Error in routing url",
            url: url,
            err: err
        }, apiCallSpan);

        apiCallSpan.finish();

        return {
            err: err,
            response: null,
            span: apiCallSpan
        };
    }
};
