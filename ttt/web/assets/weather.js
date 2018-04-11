var weatherCities  =[
    'ZBAA',
    'ZSSS',
    'ZSPD',
    'ZGGG',
    'ZGSZ',
    'ZUUU',
    'ZLXY',
    'ZPPP',
    'ZSHC',
    'ZUCK',
    'ZHCC',
    'ZHHH',
    'ZGHA',
    'ZSAM',
    'ZSNJ',
    'ZSQD',
    'ZWWW'
]
var weatherData = {
    "DZ": "毛毛雨",
    "RA": "雨",
    "SN": "雪",
    "SG": "米雪",
    "IC": "钻石尘",
    "PE": "冰粒",
    "GR": "冰雹",
    "GS": "小冰雹或雪球",
    "BR": "轻雾",
    "FG": "雾",
    "FU": "烟",
    "VA": "火山灰",
    "DU": "浮尘",
    "SA": "沙",
    "HZ": "霾",
    "PO": "发展好的沙卷/尘卷",
    "SQ": "飑",
    "FC": "漏斗云，海陆龙卷",
    "SS": "沙暴",
    "DS": "尘暴",
    "SY": "晴天"
}
var cityNames = ['北京','虹桥','浦东','广州','深圳','成都','西安','昆明','杭州','重庆','郑州','武汉','长沙','厦门','南京','青岛','乌鲁木齐']

setInterval(function(){
    var l = $('.right-content ul').css('marginLeft');
    if(l == '25px'){
        $('.right-content ul').css('marginLeft',-390)
    }else{
        $('.right-content ul').css('marginLeft',25)
    }
},30000)

$.ajaxSetup({    
    async : false    
});  
getWeatherStatus()

setInterval(function(){
    getWeatherStatus()
},60000)

function getWeatherStatus() {
    var weatherNum = 0;
    for(let i in weatherCities){
        if(weatherNum > 8){
            break;
        }
        request('http://'+DATASERVER+ROUTES.weather+'?apName='+weatherCities[i],{},function(res){
            var data = parseRequestData(res)[0];
            if(data.HVisibility && data.weatherStatus && data.windSpeed && data.weatherStatus !== ' '){
                fixWeatherContent(weatherNum,data,cityNames[i])
                weatherNum++
            }
        })
    }
    setTimeout(function(){
        var len = 8-weatherNum;
        for(var i=0;i<len;i++){
            fixWeatherContent(weatherNum+i,{weatherStatus:'SY',windSpeed:0,HVisibility:0},'无')
        }
    },0)
    
}

function fixWeatherContent(index,data,city){
    var fs = require('fs')
    var date = new Date();
    var path = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
    fs.writeFileSync(__dirname+'/logs/weather/'+path+'.txt','时间：'+date.getTime()+'  城市：'+city+'--------------data: '+data.weatherStatus.split(' ')[0].trim()+'.png'+'\r\n',{flag:'a'})

    var obj = $('.right-content ul li').eq(index);
    obj.find('img').attr('src','./assets/img/weather/'+data.weatherStatus.split(' ')[0].trim()+'.png')
    if(city){
        obj.find('span').text(city)
    }
    obj.find('p').eq(0).text(data.airTemperature+'°')
    obj.find('p').eq(1).text(weatherData[data.weatherStatus.split(' ')[0].trim()])
    obj.find('p').eq(2).text('风速：'+data.windSpeed+'米/秒')
    obj.find('p').eq(3).text('风向：'+(data.windDirection=='-1'?'不定':data.windDirection+'度'))
    obj.find('p').eq(4).text('能见度：'+data.HVisibility+'米')
}


