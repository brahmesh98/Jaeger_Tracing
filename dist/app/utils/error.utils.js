"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Tags } = require('opentracing');
exports.log = function (level, payload, span = undefined, tag = undefined) {
    if (span && payload.uid) {
        span.setTag('uid', payload.uid);
    }
    switch (level) {
        case 'error':
            if (span) {
                span.setTag(Tags.ERROR, true);
            }
            console.error(JSON.stringify(payload));
            break;
        case 'info':
            if (span && tag) {
                span.setTag('tag', tag);
            }
            console.info(JSON.stringify(payload));
            break;
        default:
            console.log(JSON.stringify(payload));
    }
    if (span) {
        span.log(payload);
    }
};
//# sourceMappingURL=error.utils.js.map