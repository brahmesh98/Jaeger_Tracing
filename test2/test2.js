const express = require('express')
const app = express()
const initJaegerTracer = require("jaeger-client").initTracer;
const { FORMAT_HTTP_HEADERS } = require('opentracing');
const bodyparser=require('body-parser');


function startTracer(serviceName,projectName,headers={}) {
    const config = {
      serviceName: serviceName,
      reporter: {
          agentHost: 'jaeger',
          agentPort: 6832,
          logSpans: true
      },
      sampler: {
        type: "const",
        param: 1,
      }
    };
  
    console.log('config:',config);
  
    const options = {
      logger: {
        info(msg) {
          console.log("INFO ", msg);
        },
        error(msg) {
          console.log("ERROR", msg);
        },
      },
    };
  
    console.log('init jaeger tracer');
  
    global[ "tracer" ] = initJaegerTracer(config, options);
  
    let parentSpan;
  
    if(Object.keys(headers).length === 0){
        console.log("new service");
        parentSpan = global[ "tracer" ].startSpan(projectName);
        
      }else{
          const parentSpanContext = global["tracer"].extract(FORMAT_HTTP_HEADERS,headers);
          console.log("extarct");
          parentSpan = global["tracer"].startSpan(projectName,{
              childOf :parentSpanContext
          });
      }
    return parentSpan;
  }

app.use(bodyparser.json());
var urlencoded=app.use(bodyparser.urlencoded({
   extended:true
}));

app.post('/square',(req,res)=>{

    var parentSpan = startTracer("call_1","Jaeger_practice",req.headers)
    var childSpan2 = global["tracer"].startSpan("childSpan2",{childOf:parentSpan});

    var n1=req.body.n1;
    console.log(n1);
    var sq=n1*n1;
    console.log(sq);
    res.status(200).jsonp({
        "square":sq
    });
    childSpan2.finish();
    parentSpan.finish();

 

});

app.listen(4241, () => console.log(`App listening ----container 1...!`))