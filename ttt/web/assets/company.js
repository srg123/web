var companyChart = echarts.init(document.getElementById('companyWrapper'));

getCompanyData()
setInterval(function(){
    getCompanyData()
},60000)


function getCompanyData(){
    request(ROUTES.aircompany,{},function(res){

        var companyData = [];
        var companyDataAxis = [];
        var companyDataAxis2 = [];
        var companyDataShadow = [];
        
        res = JSON.parse(res)

        var companys = {
            'CCA':'国航',
            'CES':'东航',
            'CSN':'南航',
            'CHH':'海航',
            'CSZ':'深航',
            'CXA':'厦航',
            'CDG':'山航',
            'CSC':'川航',
            'CQH':'春秋',
            'DKH':'吉祥',
            'GCR':'天津航',
            'CSH':'上航'
        }

        Object.keys(res.aircompanySchFlightCount).map((key)=>{
            //计划执行班次
            companyDataShadow.push(res.aircompanySchFlightCount[key]);
            companyDataAxis2.push(res.aircompanySchFlightCount[key])
            //实际执行班次
            companyData.push(res.aircompanyActFlightCount[key]);
            companyDataAxis.push(companys[key] || key)
        })
        
        companyData = companyData.slice(0,11)
        companyDataAxis = companyDataAxis.slice(0,11)
        companyDataAxis2 = companyDataAxis2.slice(0,11)
        companyDataShadow = companyDataShadow.slice(0,11)
        

        var companyOption = {
            title:{
                itemGap: -15,
                text:'今日国内航空公司班次',
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
                data: companyDataAxis,
                axisLabel: {
                    inside: false,
                    textStyle: {
                        color: '#1397ff'
                    },
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
                data: companyDataAxis2,
                axisLabel: {
                    inside: false,
                    textStyle: {
                        color: '#fff'
                    },
                    interval: 0
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
                    data: companyDataShadow,
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
                    data: companyData
                }
            ]
        };
        companyChart.setOption(companyOption);
        
    },true)
}

