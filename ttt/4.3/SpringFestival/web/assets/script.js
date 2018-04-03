//Original Example of Echarts 3
//http://echarts.baidu.com/demo.html#geo-lines
var defaultCity = ["ZYHB","ZYTX","ZYCC","ZBHH","ZBSJ","ZBYN","ZSJN","ZSOF","ZSCN","ZLXN","ZSFZ","ZLLL","ZJSY","ZULS","ZLIC","ZGNN","ZUGY"]
var map = new maptalks.Map('map',{
    center:[109.08052,36.04231],
    zoom:4.8,
    minZoom:1,
    maxZoom:5,
    zoomInCenter:true,
    layers:[
        new maptalks.VectorLayer('v')
    ]
})

// map.setPitch(28.800000000000026)

loadVector(map, "./assets/data/coastline-fixed.json", {
    name: "coastline",
    layerOptions:{
        zIndex:101
    },
    symbol: {
        'lineWidth': 1,
        'lineColor': 'rgba(57,130,222,1)',
    }
});

loadVector(map, "./assets/data/ne_110m_ocean.json", {
    name: "ocean",
    layerOptions:{
        zIndex:100
    },
    symbol: {
        'lineWidth': 0,
        'polygonFill': 'rgb(17,24,32)'

    }
});

loadVector(map, "./assets/data/china-ext.json", {
    name: "china-ext",
    layerOptions:{
        zIndex:104
    },
    symbol: {
        'lineWidth': 3,
        'lineColor': 'rgb(57,130,222)',
        'shadowBlur': 8,
        'shadowOffsetX': -5,
        'shadowOffsetY': 5
    }
});

loadVector(map, "./assets/data/china.json", {
    name: "china",
    layerOptions:{
        zIndex:103
    },
    symbol: {
        'lineWidth': 1,
        'lineColor': 'rgba(57,130,222,0.4)',
        'polygonFill':'rgba(8,25,41,0.8)'

    }
});

function loadVector(map, url, options) {
    $.getJSON(url, function (json) {
        var features = json.features;
        var vectors = [];
        features.forEach(function (f) {

            var geometry = {
                feature: f,
                symbol: options.symbol
            }


            var feature = maptalks.Geometry.fromJSON(geometry);

            vectors.push(feature);
        });

        new maptalks.VectorLayer(options.name, vectors,options.layerOptions).addTo(map);
    });
}

$.ajaxSetup({    
    async : false    
}); 

var airports = [] 

var e3Layer = new maptalks.E3Layer('e3', {
    tooltip: {
        trigger: 'item'
    },
    series: getECOption()
}).addTo(map);

setInterval(function(){
    var series = getECOption()
    e3Layer.setEChartsOption({
        tooltip: {
            trigger: 'item'
        },
        series: series
    })
},60000)

function getECOption() {
    var geoCoordMap = {};
    $.get('http://'+DATASERVER+ROUTES.airport,function(res){
        var data = JSON.parse(res).data;
        for(var i in data){
            if(data[i].apName.toUpperCase() != 'ALL'){
                geoCoordMap[data[i].airportName+""] = [data[i].lng,data[i].lat]
                if(data[i].airportLevel == 2 || data[i].airportLevel == 3 ||  defaultCity.indexOf(data[i].apName) != -1){
                    airports.push({name:data[i].airportName,apName:data[i].apName})
                }
            }
        }
    })

    var series = [];
    var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = geoCoordMap[dataItem[0].name];
            var toCoord = geoCoordMap[dataItem[1].name];
            if (fromCoord && toCoord) {
                res.push({
                    fromName: dataItem[0].name,
                    toName: dataItem[1].name,
                    coords: [fromCoord, toCoord]
                });
            }
        }
        return res;
    };

    request(ROUTES.aircompany,{},function(res){
        var data = JSON.parse(res).airportPairSchFlightCount;
        var tmpData = [];
        Object.keys(data).map((key)=>{
            if(key.charAt(0).toUpperCase() == 'Z' && key.charAt(5).toUpperCase() == 'Z'){
                tmpData.push({
                    cities:key.split('-'),
                    value:0
                })
            }
            
        })
        tmpData = tmpData.slice(0,30)
        var tmp = []
        var seriesData = []
        for(var i in tmpData){
            var startCity = ''
            var endCity = ''
            var value = 0
            $.get('http://'+DATASERVER+ROUTES.airport+'?apName='+tmpData[i].cities[0],function(res){
                var data = JSON.parse(res).data[0]
                if(data){
                    startCity = data.airportName;
                }
                
            })
            $.get('http://'+DATASERVER+ROUTES.airport+'?apName='+tmpData[i].cities[1],function(res){
                var data = JSON.parse(res).data[0]
                if(data){
                    endCity = data.airportName;
                }
            })

            $.get('http://'+DATASERVER+ROUTES.airportdynamic+'?apName='+tmpData[i].cities[0],function(res){
                
                var data = JSON.parse(res).data[0]
                try{
                    var tmp = JSON.parse(data.countStasticsResult)

                }catch(e){
                    var fs = require('fs')
                    var date = new Date();
                    var path = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
                    fs.writeFileSync(__dirname+'/logs/map/'+path+'.txt','时间：'+date.getTime()+'  城市：'+tmpData[i].cities[0]+'--------------data: '+res+'------------'+JSON.stringify(e)+'\r\n',{flag:'a'})
                }
                value = parseFloat(tmp.scheduleOnTimeRate).toFixed(3)
                
            })
            var num = i*1+1;
            if(startCity&&endCity){
                tmp.push([{'name':startCity},{name:endCity,value:value}])
            }
            if(num%6==0){
                seriesData.push(tmp)
                tmp =[];
            }
        }
        var seriesDatas = []
        for(var i in seriesData){
            seriesDatas.push([i,seriesData[i]])
        }
        var color = ['orange', 'yellow', 'darkblue','lightblue','green'];
        
        seriesDatas.forEach(
            function (item, i) {
                series.push({
                        name: item[0] + ' Top10',
                        type: 'lines',
                        zlevel: 1,
                        effect: {
                            show: true,
                            period: 6,
                            trailLength: 0.7,
                            color: '#fff',
                            symbolSize: 3
                        },
                        lineStyle: {
                            normal: {
                                color: color[i],
                                width: 0,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        name: item[0] + ' Top10',
                        type: 'lines',
                        zlevel: 2,
                        effect: {
                            show: false     
                        },
                        lineStyle: {
                            normal: {
                                color: color[i],
                                width: 2,
                                opacity: 0.4,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
    
                    {
                        name: item[0] + ' Top10',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function (val) {
                            return val[2] / 8;
                        },
                        itemStyle: {
                            normal: {
                                color: color[i]
                            }
                        },
                        data: item[1].map(function (dataItem) {
                            return {
                                // name: dataItem[1].name,
                                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
                            };
                        })
                    });
            });
            
    },true)

    // 加两千万级以上的机场
    var airports_rate = []
    for(var i in airports){
        $.get('http://'+DATASERVER+ROUTES.airportdynamic+'?apName='+airports[i].apName,function(res){
            var data = JSON.parse(res).data[0]
            var tmp = JSON.parse(data.countStasticsResult)
            var value = parseFloat(tmp.scheduleOnTimeRate).toFixed(3)
            airports_rate.push(value)
        })
    }
    series.push({
        name: '点',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',

        label: {
            normal: {
                show: true,
                textStyle: {
                    color: '#fff',
                    fontSize: 14,
                }
            }
        },
        itemStyle: {
            normal: {
                color: function (e) {
                    var rate = e.data[2];
                    if(rate<25){
                        return "#de0303";

                    }else if(rate<50){
                        return "#ffc300";
                    }else if(rate<75){
                        return "#b0cf21";
                    }

                    return "#12efa9";
                }
            }
        },
        zlevel: 6,
        symbolSize: 35,
        data: airports.map(function (dataItem,i) {
           if(dataItem.name == '上海/浦东'){
                geoCoordMap['上海/浦东'][0] = '121.9925'
            }
            if(dataItem.name == '上海/虹桥'){
                geoCoordMap['上海/虹桥'][0] = '121.13611111111111'
            }
            return geoCoordMap[dataItem.name].concat([(airports_rate[i]*100).toFixed(0)]);
        })

    })
    return series
}
