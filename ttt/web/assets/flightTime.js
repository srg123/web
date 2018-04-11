var flightChart = echarts.init(document.getElementById('flightTimeWrapper'));
getFlightTimeData()  
setInterval(function(){
  getFlightTimeData()  
},60000)

function getFlightTimeData(){
    var flightCounts = [];
    var flightDataAxis = [];
    var flightDataAxis2 = [];
    var flightData = [];
    var flightDataShadow = [];
    request('http://'+DATASERVER+ROUTES.airportdynamic,{},function(res){
        res = JSON.parse(res).data;
        for(var i in res){
            var data = JSON.parse(res[i].countStasticsResult);
            if(data.apName.toUpperCase() != 'ALL' &&  data.apName.toUpperCase()[0] != 'R' && data.apName.toUpperCase() != 'VHHH' && data.apName.toUpperCase() != 'VMMC'){
                flightCounts.push({
                    apName:data.apName,
                    emptyCount:data.SDepFlihgtsCount*1+data.SArrFlihgtsCount*1, // 计划起降架次
                    count:data.RDepFlihgtsCount*1+data.RArrFlihgtsCount*1 // 实际起降架次
                })
            }
            
        }

        flightCounts.sort(function(a,b){return b.emptyCount-a.emptyCount})
        flightCounts = flightCounts.slice(0,10)

        for(var i in flightCounts){
            $.get('http://'+DATASERVER+ROUTES.airport+'?apName='+flightCounts[i].apName,function(res){
                var data = JSON.parse(res).data[0]
                flightDataAxis.push(data.airportName)
            })
            flightDataAxis2.push(flightCounts[i].emptyCount)
            flightDataShadow.push(flightCounts[i].emptyCount)
            flightData.push(flightCounts[i].count)
        }

        var flightoOption = {
            title:{
                itemGap: -15,
                text:'今日国内机场飞行架次排名',
                textStyle:{
                    color:'#fff',
                    fontSize:20
                },
                // subtext:'\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\v\vTODAY WEATHER',
                subtextStyle:{
                    color:'#1397ff',
                    fontSize:14,
                    width:'50%'
                },
                left:30,
                top:10
            },
            grid:{
                top:70,
                left:30,
                bottom:48,
                right:16
            },
            backgroundColor:'rgba(0,0,0,0.3)',
            xAxis: [{
                data: flightDataAxis,
                axisLabel: {
                    inside: false,
                    textStyle: {
                        color: '#1397ff'
                    },
                    rotate: 45,
                    interval: 0
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                z: 10
            },{
                data: flightDataAxis2,
                axisLabel: {
                    inside: false,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                z: 10
            }],
            yAxis: {
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show:false,
                    textStyle: {
                        color: '#000'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside'
                }
            ],
            series: [
                { // For shadow
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: 'rgba(0,0,0,0.3)',
                            borderColor: '#053f68',
                            borderWidth: 2,
                            borderType: 'solid'
                        }
                    },
                    barGap:'-100%',
                    barCategoryGap:'40%',
                    data: flightDataShadow,
                    animation: false
                },
                {
                    type: 'bar',
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            color:'#00f2c4'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#01faca'},
                                    {offset: 0.5, color: '#01faca'},
                                    {offset: 1, color: '#287991'}
                                ]
                            )
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#01faca'},
                                    {offset: 0.7, color: '#01faca'},
                                    {offset: 1, color: '#287991'}
                                ]
                            )
                        }
                    },
                    data: flightData
                }
            ]
        };
        flightChart.setOption(flightoOption);
    })
}
