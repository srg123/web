var develop = false;
var DATASERVER = develop?'172.30.8.80:3000':'127.0.0.1:3000';
var ROUTES = {
    'onDutyPerson':'/get_ondutypeople',
    'airportdynamic':'/get_airportdynamic?apName=ALL',
    'weather':'/get_weather',
    'aircompany':develop?'http://172.30.8.208:8080/GeneralMonitor/rest/monitor/flightCountRankingData':'./assets/data/flightCountRanking.txt',
    'airport':'/get_airport',
    'airportdynamic':'/get_airportdynamic_less'
}

$.ajaxSetup({    
    async : false    
});  

// 左侧菜单
generateMenuList()
getOnDutyPerson()
setInterval(function(){
    generateMenuList()
    getOnDutyPerson()
},60000)
function generateMenuList(){
    var name = [
        "scheduleFlightsCount",
        "nnsFlightsCount",
        "nfsFlightsCount",
        "fasFlightsCount",
        "fosFlightsCount",
        "specialFlightsCount",
        "vipFlightsCount",
        "executeDepFlihgtsCount",
        "executeArrFlihgtsCount",
        "cld120FlightsCount",
        "delayFlightsCount",
        "scheduleOnTimeRate",
        "delayAvgTime"
    ]
    request('http://'+DATASERVER+ROUTES.airportdynamic+'?apName=ALL',{apName:'ALL'},function(res){
        var tmp = parseRequestData(res)[0]
        var data = JSON.parse(tmp.countStasticsResult);
        $(name).each(function(index,id){
            var val = data[id];
            if(id == 'scheduleOnTimeRate'){
                val = Math.round(data.scheduleOnTimeRate*100)+'%'
            }
            $('#'+id).text(val)
        })
        
    })  
}

// 获取值班人员信息
function getOnDutyPerson(){
    request('http://'+DATASERVER+ROUTES.onDutyPerson,{},function(res){
        var data = parseRequestData(res)[0].onDutyPerson;
        var leader = '';
        data = JSON.parse(data);
        if (data.atmbLeader) {
          try {
            var leaderArr = data.atmbLeader.split(/[\s+|\,|、]/);
            if (leaderArr && leaderArr.length) {
              leader = '值班领导：民航局' + leaderArr[0] + ' 监控中心' + (leaderArr[1] || '')
            }
          } catch (e) {

          }
        }
        $('.notice span').text(leader + ' 值班大厅' + data.omcLeader)
    })
}

// 日期
var dateText = $('.date').eq(0);
getNowTime()

setInterval(function(){
    getNowTime()
},1000)

function parseRequestData(res){
    var data = null;
    if(develop){
        data = JSON.parse(res).data
    }else{
        data = JSON.parse(res).data
    }
    return data
}

function request(url,data,callback,flag){
    if(!flag){
        $.get(url,callback)
    }else{
        $.post(url,data,callback)
    }
}

function getNowTime(){
    var oDate = new Date();
    var y = oDate.getFullYear();
    var m = oDate.getMonth()+1;
    var d = oDate.getDate();

    var h = oDate.getHours();
    var min = oDate.getMinutes();
    var s = oDate.getSeconds();

    dateText.text(y+'-'+toDub(m)+'-'+toDub(d)+' '+toDub(h)+':'+toDub(min)+':'+toDub(s));
}

function toDub(n){
    return n>9?''+n:'0'+n
}