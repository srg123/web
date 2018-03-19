
var socket2 = '';

$(function(){

    //获取配置服务器的IP地址
    var host = CONFIG.WEBSOCKET_IP;
    //链接配置服务器
    var socket = io.connect("ws://"+host+":"+CONFIG.WEBSOCKET_PORT);
    var initData = false;//是否初始化信息
    var initObj = {}; //存储初始化信息
    var maskState = false;
    var MAX_TIME = 6270625;//最大时间
    var speedLine = false;//当前是不是在滑动模块
    var playTimePregress = false;//当前是不是飞机滑块
    var MAX_DIS = 800;  //   控制进度条的最大宽度
    var isEnterNewTime = false;

/*
    //初始化连接成功数据
    socket.on('connect',function(){
        init();
        socket2 = socket;
    });

    //第一次初始化
    function init(){
        socket.emit('reg_group',{type:'control',id:'screen_control'})
        // //订阅对应事件
        // socket.emit('sub_script',['cpdlc_script']);
    }

    //接收到可以初始化事件
    socket.on('can_sub_script',function(data){
        // alert('1初始化')
        socket.emit('sub_script',['director_script']);
    })


    //初始化信息
    socket.on('receive_init_data',function(data){
        console.log("1: receive_init_data")
    })

    //时间更新
    socket.on('new_screen_time_data',function(dataObj){
        //	控制进度条
        autoPlay(dataObj);

        /!*if(timeChanging==true) return; //滑块被操作
        var _temp = dataObj.time/MAX_TIME;
            _temp = parseInt(_temp*100);
            $('#timeLine').val(_temp)*!/
        // var _maxTime = $('.speed_strip').css('width');
        // var _offset = parseInt(_temp*parseInt(_maxTime));
        // console.log(_offset)
        // $('.speed_strip .vertical').css('left',_offset);
        // $('.speed_strip .line').css('width',_offset);

    })

    //接收到事件
    socket.on('new_event',function(eventObj){

        // var _json = JSON.stringify(eventObj);
        // console.log(_json)

        var _name = Object.keys(eventObj);
        var event_i,script_data,_temp1,_temp2,_$dom;
        switch (_name[0]){


            case 'director_script':
                //初始化事件
                if(eventObj['event_type']=="receive_init_data"){
                    //console.log("初始化事件")
                    MAX_TIME = eventObj['director_script']['maxtime'];


                }else{
                    //非初始化事件
                    //console.log("非初始化事件")
                    //添加导演脚本触发的效果切换事件
                    console.log(eventObj)
                    script_data = eventObj['director_script']['data']

                    if(eventObj['director_script']["refresh"] == true){
                        console.log("refresh true");
                        // console.log(refreshFormat(script_data));
                        script_data = refreshFormat(script_data);
                    }


                    for(event_i in script_data){
                        //管制移交时间线
                        if(script_data[event_i]["sender"] =="timeline"){

                        }

                        //视角控制
                        if(script_data[event_i]["sender"] =="camera"){
                            // <EVENT$0.0000#"+_id1+"#ControlView#1>
                            // if(script_data[event_i]['type']==)

                            //第一人
                            if(script_data[event_i]['type'] == 'FirstPerson'){
                                console.log('c3d_socket FirstPerson')
                                _$dom = $('#camera_control');
                                _$dom.find('.selected').removeClass('selected').addClass('default');
                                _$dom.find("[data-type='0']").addClass('selected').removeClass('default');;
                            }

                            //跟随
                            if(script_data[event_i]['type'] == 'ThirdPerson'){
                                console.log('c3d_socket ThirdPerson')
                                _$dom = $('#camera_control');
                                _$dom.find('.selected').removeClass('selected').addClass('default');
                                _$dom.find("[data-type='1']").addClass('selected').removeClass('default');;
                            }

                            //自由
                            if(script_data[event_i]['type'] == 'FreeView'){
                                console.log('c3d_socket FreeView')
                                _$dom = $('#camera_control');
                                _$dom.find('.selected').removeClass('selected').addClass('default');
                                _$dom.find("[data-type='2']").addClass('selected').removeClass('default');
                            }

                            //多物体
                            if(script_data[event_i]['type'] == 'FixedTarget'){
                                console.log('c3d_socket FixedTarget')
                                _$dom = $('#camera_control');
                                _$dom.find('.selected').removeClass('selected').addClass('default');
                                // _$dom.find("[data-type='0']").addClass('selected');
                            }
                        }






                        //特效
                        if(script_data[event_i]["sender"]=='effect_1'){
                            //PBN控制
                            console.log('c3d_socket PBN')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_pbn_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_pbn_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }
                        }

                        if(script_data[event_i]["sender"]=='effect_2'){
                            //引导路线
                            console.log('c3d_socket GuideVisible')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_guide_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_guide_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }
                        }

                        if(script_data[event_i]["sender"]=='effect_3'){
                            // 入侵检测
                            console.log('c3d_socket RQJC')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_rqjc_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_rqjc_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }

                        }

                        if(script_data[event_i]["sender"]=='effect_4'){
                            // 规划航迹路径
                            console.log('c3d_socket GHHXLJ')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_ghhxlj_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_ghhxlj_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }
                        }


                        if(script_data[event_i]["sender"]=='effect_5'){
                            // 规划航迹路径
                            // 规划航迹路径
                            console.log('c3d_socket ZDYD')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_zdyd_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_zdyd_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }
                        }

                        if(script_data[event_i]["sender"]=='effect_7'){
                            // 清除航路点
                            console.log('c3d_socket TrackOn')
                            if(script_data[event_i]['on_off']==0){
                                //关闭
                                $('#control_trackOn_change').removeClass('selected').addClass('default').attr('data-type',0)
                            }else{
                                //打开
                                $('#control_trackOn_change').removeClass('default').addClass('selected').attr('data-type',1)
                            }
                        }


                        //天气控制
                        if(script_data[event_i]["sender"] =="weather"){
                            console.log('c3d_socket weather')
                            _$dom = $('#weather_control');
                            _$dom.find('.selected').removeClass('selected').addClass('default');
                            _$dom.find("[data-type='"+script_data[event_i]['type']+"']").addClass('selected').removeClass('default');
                        }


                    }
                }
                break;

            case "ERR":
                console.log("页面收到错误事件")
                break;
        }

    });

    //初始化信息
    socket.on('RESTE',function(data){
        alert('RESTE');
    })

    //遮罩层信息
    socket.on('mask_switch',function(data){
        if(data==true){
            //开启遮罩层
            maskState = true;
        }

        if(data==false){
            // 关闭遮罩层
            maskState = false;
        }
        //初始化信息
    })

    //刷新登录状态
    socket.on('new_mod_online',function(data){
        var mod_name=null;
        $('#status_bar span').each(function(){
            mod_name = $(this).attr('data-mod_name');
            if(data[mod_name]==true){
                $(this).addClass('selected').removeClass('default');
            }
        })
    })
*/

//仿真时间控制

//	进度控制
    var points = [137,276,415,555,692,814];
    var $box = $('.time-ceil');
    var $bg = $('#bg');
    var $bgcolor = $('#bgcolor');
    var $btn = $('#bt');
    var $text = $('#text');
    var statu = false;
    var ox = 0;
    var lx = 0;
    var left = 0;
    var bgleft = 0;
    var showPoint = $('.circle');
    // var autoInterval = setInterval(autoPlay,1000);
    $btn.mousedown(function(e){
        if(isEnterNewTime == false){
            alert('请先确认仿真初始时间');
            return;
        }
        lx = $btn.offset().left;
        ox = parseInt(e.pageX - left);
        playTimePregress = true;
        statu = true;
    });
    $(document).mouseup(function(){
        if (document.releaseCapture) this.releaseCapture();

        if(statu==false) return;

        statu = false;
        var _ee = $btn.attr('data-value');
        socket.emit('control_goToPlayTime',_ee);

    });

    $('body').mousemove(function(e){
        //$box.mousemove(function(e){
        //playTimePregress = true;
        var e = e || window.event;
        if (document.setCapture) this.setCapture();
        if (window.captureEvents) window.captureEvents(Event.MOUSEMOVE || Event.MOUSEUP);
        //this.style.cursor = 'move';
        // clearInterval(autoInterval);
        if(statu){
            console.log(ox)
            left = parseInt(e.pageX - ox);
            if(left < 14){
                showPoint.eq(0).addClass('add_circle');
                left = 14;
            }
            showPoints(left);
            if(left > 814){
                left = 814;
            }
            $btn.css('left',left + "px");
            $bgcolor.width(left + "px");
            $text.html('位置:' + parseInt(left/2) + '%');

            //    当用户滑动时判断飞机飞行的时间点
            var currentRatio = (left-14)/MAX_DIS;
            //    飞机飞行的时间节点
            var planeFly = Math.round(currentRatio*MAX_TIME);

            $btn.attr('data-value',planeFly)

            //socket.emit('control_goToPlayTime',planeFly);

        }
    });

    $box.mouseleave(function () {
        if (document.releaseCapture) this.releaseCapture();
        if(playTimePregress == true){
            playTimePregress = false;
        }
    })

    $bg.click(function(e){
        playTimePregress = true;
        var e = e || window.event;
        // clearInterval(autoInterval);
        if(!statu){
            bgleft = $bg.offset().left;
            left = parseInt(e.pageX - bgleft);
            if(left < 14){
                showPoint.eq(0).addClass('add_circle');
                left = 14;
            }
            showPoints(left);
            if(left > 814){
                left = 814;
            }
            $btn.css('left',left+"px");
            $bgcolor.stop().animate({width:left+"px"},100);
            $text.html('位置:' + parseInt(left/2) + '%');

            //    当用户滑动时判断飞机飞行的时间点
            var currentRatio = (left-14)/MAX_DIS;
            //    飞机飞行的时间节点
            var planeFly = Math.round(currentRatio*MAX_TIME);

            socket.emit('control_goToPlayTime',planeFly);
        }
    });



})
