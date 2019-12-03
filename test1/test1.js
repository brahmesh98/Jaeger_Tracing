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

app.post('/cube',(req,res)=>{
      var parentSpan = startTracer("call_1","Jaeger_practice",req.headers)
      var childSpan = global["tracer"].startSpan("childSpan",{childOf:parentSpan});
    var n2=req.body.n2;
    console.log(n2);
    var cube=n2*n2*n2;
    console.log(cube);
    res.status(200).jsonp({
        "cub":cube
    });
    childSpan.finish();
    parentSpan.finish();
    
});

app.listen(4242, () => console.log(`App listening ----container 1...!`))