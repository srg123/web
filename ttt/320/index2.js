
var websoket_port = CONFIG.WEBSOCKET_PORT || 3060;
var host = window.location.hostname;
host = "127.0.0.1";

$(function(){

    //连接服务器socket
    var socket = io.connect("ws://"+host+":"+CONFIG.WEBSOCKET_PORT);

    var initData = false;//是否初始化信息
    var initObj = {}; //存储初始化信息
    var maskState = false;
    var MAX_TIME = 6270625;//最大时间
    var speedLine = false;//当前是不是在滑动模块
    var playTimePregress = false;//当前是不是飞机滑块
    var MAX_DIS = 800;  //   控制进度条的最大宽度
    var isEnterNewTime = false;

    //初始化连接成功数据
    socket.on('connect',function(){
        console.log("连接成功");
        init();
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

        /*if(timeChanging==true) return; //滑块被操作
        var _temp = dataObj.time/MAX_TIME;
            _temp = parseInt(_temp*100);
            $('#timeLine').val(_temp)*/
        // var _maxTime = $('.speed_strip').css('width');
        // var _offset = parseInt(_temp*parseInt(_maxTime));
        // console.log(_offset)
        // $('.speed_strip .vertical').css('left',_offset);
        // $('.speed_strip .line').css('width',_offset);

    })
    //接收到事件
    socket.on('new_event',function(eventObj){

        var _json = JSON.stringify(eventObj);
        console.log(_json)

        var _name = Object.keys(eventObj);
        switch (_name[0]){


            case 'director_script':
                //初始化事件
                if(eventObj['event_type']=="receive_init_data"){
                    //console.log("初始化事件")
                    MAX_TIME = eventObj['director_script']['maxtime'];


                }else{
                    //非初始化事件
                    //console.log("非初始化事件")

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




    //公共按钮样式切换
    $('.control-button-box li').click(function(){

        //视角控制部分
       if(isEnterNewTime== false){
            return;
        }

        var $this = $(this);
        var _type = $this.attr('data-type');
        var camera_id = $this.parents('#camera_control').attr('data-camera_id');
        var plane_id = $this.parents('#camera_control').attr('data-plane_id');

        // alert($this.siblings('.selected').length)
        $this.parents('#camera_control').attr('data-type',_type);

        if(isEnterNewTime){
            $this.siblings('.selected').removeClass('selected').addClass('default');
            $this.removeClass('default').addClass('selected');

           // $this.find(".icon").css({"background":'url("./img/inner-view-active.png") center center no-repeat'});
            //$this.find("span").css({"color": "#00C1E5"});

        }

        $this.siblings('.selected').removeClass('selected').addClass('default');
        $this.removeClass('default').addClass('selected');


        if(socket){
            socket.emit('control_camera_change',{
                'type':_type,
                'camera_id':camera_id,
                'plane_id':plane_id
            });
        }

    });

    // 报文
   $('#control_Modular02_display1').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }


        if(socket){
            socket.emit('modular_message',{
                eventID:'display1',
                fromID:'screen_control',
                toID:'screen_cpdlc',
                value:_type
            });
        }

    });
    $('#control_Modular02_display2').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('modular_message',{
                eventID:'display2',
                fromID:'screen_control',
                toID:'screen_cpdlc',
                value:_type
            });
        }

    });

    //报文状态控制 --》单样式切换
/*    $('.control-button2 li').click(function () {
        console.log("点击了");
        if($(this).hasClass('model_commit')){
            $(this).removeClass('model_commit');
            return;
        }
        $(this).toggleClass('model_commit');
    });*/

    // 仿真单元状态
     $(".util-control-box li:not(':last')").click(function () {
    //$(".util-control-box li").click(function () {
        var $this = $(this);
        $this.siblings('.selected').removeClass('selected').addClass('default')
        $this.removeClass('default').addClass('selected');
    });

  /*  $('.ng').click(function () {
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            return;
        }
        $(this).toggleClass('active');
    });*/


    //天气部分
    $('#weather_control span').click(function(){

        var $this = $(this);
        var _type = $this.attr('data-type');
        var id = $this.parents('#weather_control').attr('data-c3d_id');
        // alert($this.siblings('.selected').length)
        $this.parents('#weather_control').attr('data-type',_type);

        if(socket){
            socket.emit('control_weather_change',{'type':_type,'id':id});
        }

    });

    //特效控制-----------------------
/*
    //引导文字控制 规划航迹路径
    $('#control_ghhxlj_change').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('control_ghhxlj_change',{'on_off':_type});
        }

    });

    //自动引导控制
    $('#control_zdyd_change').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('control_zdyd_change',{'on_off':_type});
        }

    });

    //引导文字控制 入侵检测
    $('#control_rqjc_change').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('control_rqjc_change',{'on_off':_type});
        }

    });

    //航路
    $('#control_guide_change').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('control_guide_change',{'on_off':_type});
        }

    });

    //航路控制点
    $('#control_hlkz_change').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-type');

        if(_type == 0){
            $this.attr('data-type','1')
            _type = 1;
        }else{
            $this.attr('data-type','0')
            _type = 0;
        }

        if(socket){
            socket.emit('control_hlkz_change',{'on_off':_type});
        }

    });*/

    $(".util-affect-box li:not(':last')").click(function(){


        var $this = $(this);
        var _type = $this.attr('data-type');
        var camera_id = $this.parents('#special_effects_option').attr('data-ffects_id');
        var plane_id = $this.parents('#special_effects_option').attr('data-plane_id');

        // alert($this.siblings('.selected').length)
        $this.parents('#special_effects_option').attr('data-type',_type);

        $this.siblings('.selected').removeClass('selected').addClass('defaults')
        $this.removeClass('defaults').addClass('selected');

        if(socket){

            if(_type == 1){
                //引导文字控制 规划航迹路径
                socket.emit('control_zdyd_change',{'on_off':_type});
            }
            if(_type == 2){
                //自动引导控制
                socket.emit('control_zdyd_change',{'on_off':_type});
            }
            if(_type == 3){
                //引导文字控制 入侵检测
                socket.emit('control_rqjc_change',{'on_off':_type});
            }
            if(_type == 4){
                //航路
                socket.emit('control_guide_change',{'on_off':_type});
            }
            if(_type == 5){
                //航路控制点
                socket.emit('control_hlkz_change',{'on_off':_type});
            }


        }

    });

/*
    $(".util-affect-box li:not(':last')").click(function () {
      //  $(".mt li").click(function () {
            console.log("dianjile");
        var $this = $(this);

    });
*/

   //仿真时间设置---------------------

    //默认初始化时间为当前时间
    var oDate = new Date(); //实例一个时间对象；

    $('#simulate-year').val(oDate.getFullYear() + '');
    $('#simulate-month').val((oDate.getMonth()+1) + '');
    $('#simulate-day').val(oDate.getDate() + '');
    $('#simulate-hours').val(oDate.getHours() + '');
    $('#simulate-minutes').val(oDate.getMinutes() + '');
    $('#simulate-second').val(oDate.getSeconds() + '');

    //提交按钮发送事件
    $('#timeEnter').click(function () {


        // $(this).css({"background":'#F39800',"color":'black',"cursor":'not-allowed'});
        $(this).css({"background":'#1F1F1F',"color":'dimgray',"cursor":'not-allowed'});
        //添加默认选项
        //----视觉默认控制
        // $('#camera_control span').eq(1).removeClass('default').addClass('selected');
        //---布局控制
        // $('#window_control span').eq(0).removeClass('default').addClass('selected');
        // $('#source_control span').eq(0).removeClass('default').addClass('selected');
        //$('#source_control .instructions').css({'display':'block'});
        //--天气控制
        // $('#weather_control span').eq(0).removeClass('default').addClass('selected');
        //特效预设
        // $('.special_effects').addClass('common_default');
        // $('#special_effects_option').find('.defaults').addClass('selecteds');
        //报文模式控制
        // $('#control_Modular02_display2').addClass('model_commit');
        // $('#control_Modular02_display1').addClass('model_commit');

        //$('.notclick').removeClass('notclick');
        //$('#notclick_box_r').css('display','none');
        //年


        var years =$('#simulate-year').val();
        //月
        var months = $('#simulate-month').val();

        //日
        var days = $('#simulate-day').val();

        //时
        var hours1 = $('#simulate-hours').val();

        //分
        var minutes1 = $('#simulate-minutes').val();
        //秒
        var second = $('#simulate-second').val();


        if(months<10){months="0"+months;}
        if(days<10){days="0"+days;}
        if(hours1<10){hours1="0"+hours1;}
        if(minutes1 < 10){minutes1 = "0" + minutes1;}
        if(second < 10){second = "0" + second;}

        var ms = years + "-" + months + "-" + days + " " + hours1 + ":" + minutes1;
        //将时间转换为毫秒
        var formatTimeS = new Date(ms).getTime();

        //socket.emit('control_setNewTime',formatTimeS);

        isEnterNewTime = true;
        $(this).unbind();
        $('.simulation_time_setting input').attr('disabled','disabled');


    })

    //	进度控制

  /*  根据飞机滑动距离左面的宽度来决定时间点出现的位置来决定时间轴上点的样式
    点固定存在时间轴上
    left = parseInt(e.pageX - ox);
    飞机滑块宽度与总进度条的比值与总时间数的积为飞机飞行的时间节点*/

    var points = [137,276,415,555,692,814,900];
    var $box = $('#box');
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
    console.log(showPoint);
    // var autoInterval = setInterval(autoPlay,1000);
    $btn.mousedown(function(e){
        if(isEnterNewTime == false){
            alert('请先确认仿真初始时间');
            return;
        }
        lx = $btn.offset().left;
       // console.log(lx);
        ox = parseInt(e.pageX - left);
       // console.log(ox);
        playTimePregress = true;
        statu = true;
    });
    $(document).mouseup(function(){
        if (document.releaseCapture) this.releaseCapture();

        if(statu==false) return;

        statu = false;
        var _ee = $btn.attr('data-value');
        //console.log(_ee);
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

            left = parseInt(e.pageX - ox);
            if(left < 13){
                console.log(left);
                //console.log(showPoint.eq(0));
                showPoint.eq(0).addClass('add_circle');
                left = 13;
            }
            showPoints(left);
            if(left > 900){
                left = 900;
            }
            $btn.css('left',left + "px");
            $bgcolor.width(left + "px");
            //$text.html('位置:' + parseInt(left/2) + '%');

            //    当用户滑动时判断飞机飞行的时间点
            var currentRatio = (left-13)/MAX_DIS;
            //    飞机飞行的时间节点
            var planeFly = Math.round(currentRatio*MAX_TIME);

            $btn.attr('data-value',planeFly)

            socket.emit('control_goToPlayTime',planeFly);

        }
    });
    $box.mouseleave(function () {
        if (document.releaseCapture) this.releaseCapture();
        if(playTimePregress == true){
            playTimePregress = false;
        }
    })

    // 自动播放
    // var  bglefts =$btn.offset().left-70;
    function autoPlay(dataObj) {
        if(playTimePregress==true) return; //飞机滑块被操作
        var temps = dataObj.time/MAX_TIME;
        bglefts = parseInt(temps*MAX_DIS);
        showPoint.eq(0).addClass('add_circle');
        $btn.css('left',bglefts);
        $bgcolor.width(bglefts);
        showPoints(bglefts);
        if(bglefts>814){
            bglefts =14;
        }
    }

    //计算圆点出现的位置
    function showPoints(left) {
        for(var i=0;i<points.length;i++){
            left>=points[i]?showPoint.eq(i+1).addClass('add_circle'):showPoint.eq(i+1).removeClass('add_circle');
        }
    }

   //播放进度设置
    $('.speed_strip').find('.vertical').on('mousedown', function (e) {
        var downX = e.pageX;
        var verticalLeft = $('.speed_strip').find('.vertical').css('left');
        var numberLeft = Number(verticalLeft.replace(/[^0-9]/ig,""));
        $('.right-ceil').on('mousemove', function (e1){
            var moveX = e1.pageX;
            var val = numberLeft - (downX - moveX);
            if (downX - moveX <= 0) {
                val = Math.min(val , 200);
            }else {
                val = Math.max(val , 0);
            }
            $('.speed_strip').find('.vertical').css({
                "left": val
            })
            $('.speed_strip').find('.line').css({
                "width": val
            })

        })
        $('.right-ceil').on('mouseup', function (e2){
            var goToTime = 0;//获得的时间 line
            var _thatTime = $('.speed_strip .vertical').css('left');
            var  _maxTime = $('.speed_strip').css('width');
            _thatTime = parseInt(_thatTime);
            _maxTime = parseInt(_maxTime)
            var _temp = _thatTime/_maxTime;
            _temp = _temp*MAX_TIME;
            _temp = parseInt(_temp);
            goToPlayTime(_temp);
            console.log(_temp);
            $(this).off('mousemove');
            $(this).off('mouseup');

        })
    })

    //布局模块 预设窗口控制
    $('#window_control li').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-value');
        $this.siblings('.selected').removeClass('selected').addClass('default')
        $this.removeClass('default').addClass('selected');

        //$('#source_control li').removeClass('selected').addClass('default');
        //$('#source_control '+"[data-value='"+ _type +"']").removeClass('default').addClass('selected');
    })

    //信号源控制
    $('#source_control li').click(function(){
        var $this = $(this);
        var _type = $this.attr('data-value');
        // $this.parents('#source_control').attr('data-type',_type);
        $this.siblings('.selected').removeClass('selected').addClass('default')
        $this.removeClass('default').addClass('selected');

        $("#window_control li.selected").attr('data-value',_type);

        var out_obj = {};
        var _temp,_$dom,_key,_value;
        $('#window_control li').each(function(index,elem){
            _key = $(elem).attr('data-type');
            _value = $(elem).attr('data-value');
            out_obj[_key] = _value;

        });

        if(socket){
            socket.emit('control_window_change',out_obj);
        }

        console.log(out_obj);
    });
})