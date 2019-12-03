const express = require('express')
const app = express()
const bodyparser=require('body-parser');
const axios = require('axios');
const initJaegerTracer = require("jaeger-client").initTracer;
const { FORMAT_HTTP_HEADERS } = require('opentracing');


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
app.use(bodyparser.urlencoded({
   extended:true
}));


app.post('/api',(req,res)=>{

    let parentSpan = startTracer("call_1","Jaeger_practice",{});
    let headers = {
        Accept: 'application/json;charset=UTF-8',
    };
    let apiCallSpan = global[ "tracer" ].startSpan( "child_span", { childOf: parentSpan });
    global["tracer"].inject(apiCallSpan,FORMAT_HTTP_HEADERS,headers);
    axios.all([
    axios.post('http://test1:4242/cube',{n2: req.body.n2},{headers:headers}),
    axios.post('http://test2:4241/square', {n1: req.body.n1},{headers:headers})])
        .then(axios.spread((cubeRes,sqRes) => {
            var res1=sqRes.data.square;
            console.log(res1);
            var res2=cubeRes.data.cube;
            console.log(res2);
            var sum=res1+res2;
            console.log(sum);
            //childspan.finish();
            parentSpan.finish();
           
            return (res.status(200).jsonp({
                "squa":res2,
                "cube_n2":res1,
                "sum":sum
            }));

        })).catch(function (error) {
        console.log(error);
  
  
         return res.status(400).jsonp({message:'An error occurred'});
        });
        
    });


app.listen(4000, () => console.log(`App listening !`))