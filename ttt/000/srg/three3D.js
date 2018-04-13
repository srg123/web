
var camera, scene, renderer, controls;
var isLoading = true;
var texture = {
    colorMap: null,
    bumpMap: null,
    stroke: null,
    specMap: null
}


var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var mapSize = {
    width: 4096,
    height: 2048
};
var mapCanvas, mapTexture;

//cloud
var tilt = 0.41;
var cloudsScale = 1.005;
var moonScale = 0.23;

var lineColor = 0x5dd8d8;
var colorArray = [ new THREE.Color( 0xff0080 ), new THREE.Color( 0xffffff ), new THREE.Color( 0x8000ff ) ];
var lineWidth = 10;
var lineHeight = 0.13;

var timer = 0;



//飞线(样条曲线：CatmullRomCurve3)路径数组
var spline_curves = []
//飞线(每条样条曲线CatmullRomCurve3中点的数目)长度数组
var trail_flight_distance = []
//每次飞行动画起始结束时间
var flight_start_time = []
var flight_end_time = []

var trail_points = []     //飞线点

var trail_paths = []      //飞线路径
var ml_arr = []

var clock = new THREE.Clock();
var resolution = new THREE.Vector2(windowWidth , windowHeight);

/*
 * 显示控制变量
 * */

var radius = 10;
var segments = 32;


//飞线点数量
var trail_points_num = 400;
//飞线轨迹点数量
var trail_path_points_num = 1200;
// 飞线路径数量
var trail_path_count = 0;

//加载状态

//显示比例
var aspect = window.innerWidth / window.innerHeight;

init();

/*/!*
  * 生成标记点和曲线
  * *!/
generateAllPathsPoints(radius)   //主要作用飞线路径的生成
getCurvePoints()     //飞线路径上点的控制
createLines()

for (var i = 0; i < trail_path_count; i++) {
    setFlightTimes(i);
}*/

animate();

function init(){

    var container = document.getElementById( 'container' );
    //New scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
    //camera.position.x = 30;
    camera.position.z = 20;
    //camera.lookAt(new THREE.Vector3( 116, 39.2, 0 ));

    //New Renderer

    renderer=new THREE.WebGLRenderer({
   /*   antialias:true,       //是否开启反锯齿
        precision:"highp",    //着色精度选择
        alpha:true,           //是否可以设置背景色透明
        premultipliedAlpha:false,
        stencil:false,
        preserveDrawingBuffer:true, //是否保存绘图缓冲
        maxLights:1           //maxLights:最大灯光数*/
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    //设置canvas背景色(clearColor)和背景色透明度（clearAlpha）
    renderer.setClearColor(0x000000,0.5);

    // Lights

    var ambient = new THREE.AmbientLight( 0xffffff);
    //scene.add( ambient );

    var light = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( light );

    controls = new THREE.TrackballControls(camera);
    //controls.minDistance = 100;
    //controls.maxDistance = 600;


    var all_mesh  = new THREE.Object3D();

   /* 调整中国位置*/

     //all_mesh.rotateX( - Math.PI / 5 );
     // all_mesh.rotateY( - Math.PI/15 );
     //all_mesh.scale.set(0.3, 0.3, 0.3);
      all_mesh.rotation.x = 0.6
      all_mesh.rotation.y = -1.9
      all_mesh.rotation.z = -0.1

    //纹理加载
    var textureLoader = new THREE.TextureLoader();
    var colorMap = textureLoader.load("./assets/img/earth/land_mask_LH_all.png");
  /* var bumpMap = textureLoader.load("./assets/img/earth/bump.jpg");
     var specMap = textureLoader.load("./assets/img/earth/earthspec.jpg");*/
  // var stroke = textureLoader.load("./assets/img/earth/stroke.png");

/*    var convertImageToCanvas = function(mapSize) {
        var canvas;
        // 创建canvas DOM元素，并设置其宽高和图片一样
        mapCanvas = document.createElement( 'canvas' );
        mapCanvas.width = mapSize.width;
        mapCanvas.height = mapSize.height;

        img = new Image();
        img.src = "./assets/img/earth/land_mask_LH_all.png";
        img.onload=function(){
            // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
            mapCanvas.getContext("2d").drawImage(img,0,0,100,100);
            //ctx.drawImage(img,0,0,100,100,300,100,100,100);
        }
        return canvas;
    }*/

     //Create a sphere to make visualization easier.
    var geometry = new THREE.SphereGeometry(radius, segments, segments);
    var material = new THREE.MeshPhongMaterial({
        color: 0x000033
        /*wireframe: true,
        transparent: true*/
      /* wireframe: true,
        transparent: true,
        specular: 0x333333,
        shininess: 15,*/
        // map: colorMap
        //specularMap: specMap,
       // bumpMap: bumpMap,
       // bumpScale: 0.1,
       // specularMap: textureLoader.load( "./assets/img/earth/earth_specular_2048.jpg" ),
       // normalMap: textureLoader.load( "./assets/img/earth/earth_normal_2048.jpg" ),
       // normalScale: new THREE.Vector2( 0.85, 0.85 )
    });
    //material.map = colorMap;
    // need to flag the map as needing updating.
    //material.map.needsUpdate = true;

    var sphere = new THREE.Mesh(geometry, material);
    all_mesh .add(sphere);


    //Draw the GeoJSON
    $.getJSON("./assets/data/china.json", function(data) {
        drawThreeGeo(data, 10, 'sphere', {
             color: 0x003366
        },all_mesh );
    });
 /*   $.getJSON("./assets/data/test_geojson/countries_states.geojson", function(data) {
        drawThreeGeo(data, 10, 'sphere', {
            color: 0x003366
        },all_mesh );
    });*/


    scene.add(all_mesh);

}


/*function init() {

    /!*
    航班，机场，路线数据结构模拟
    {
         airlineFields:["name", "country"] 航空领域
         airportsFields:["name", "city", "country", "longitude", "latitude"]   机场领域
         airlines:[["Air France", "France"], ["easyJet", "United Kingdom"], ["Southwest Airlines", "United States"],…] 航班
         airports:[["Goroka", "Goroka", "Papua New Guinea", 145.391881, -6.081689],…]   机场
         routes:[[9, 4242, 3777], [9, 4242, 3653], [9, 3619, 3571], [9, 3911, 3571], [9, 3911, 3385], [9, 3911, 3731],…]  路线
     }
     *!/

    // RENDERER
    renderer = new THREE.WebGLRenderer(/!*{antialias: true, alpha: true}*!/);
    //renderer.setClearColor(0x000000, 1);
    //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(domWidth, domHeight);
    this.dom.append(renderer.domElement);

    //SCENE
    scene = new THREE.Scene();

    //包裹
     all_mesh = new THREE.Object3D()

    /!*
     * 调整中国位置
     * *!/
  /!*  all_mesh.rotation.x = -0.6
    all_mesh.rotation.y = -0.4
    all_mesh.rotation.z = 0.2
   all_mesh.scale.set(0.3, 0.3, 0.3);*!/

    //
    scene.add(all_mesh)

    // 摄像机
    camera = new THREE.PerspectiveCamera(75, aspect, 0.5, 1000);
    //camera.position.z = -500;

    // 平行光
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    directionalLight.position.set(5, 3, 5);
   // scene.add( directionalLight );

    // Lights

    var ambient = new THREE.AmbientLight( 0x101010 );
    scene.add( ambient );

    //纹理加载
    var textureLoader = new THREE.TextureLoader();
    var colorMap = textureLoader.load("./assets/img/earth/land_mask_LH_all.png");
    var bumpMap = textureLoader.load("./assets/img/earth/bump.jpg");
    var specMap = textureLoader.load("./assets/img/earth/earthspec.jpg");
    var stroke = textureLoader.load("./assets/img/earth/stroke.png");

    texture = {
        colorMap: colorMap,
        bumpMap: bumpMap,
        stroke: stroke,
        specMap: specMap
    }

    // 地球
 /!*   var earth_geo = new THREE.SphereGeometry(radius, segments, segments);
    var earth_mat = new THREE.MeshPhongMaterial({
          color: 0x333333,
          wireframe: true,
          transparent: true,
        // specular: 0x333333,
         //shininess: 15,
         // map: colorMap
        //specularMap: specMap,
        //bumpMap: bumpMap,
        //bumpScale: 0.1,
        //specularMap: textureLoader.load( "./assets/img/earth/earth_specular_2048.jpg" ),
       // normalMap: textureLoader.load( "./assets/img/earth/earth_normal_2048.jpg" ),
       // normalScale: new THREE.Vector2( 0.85, 0.85 )

    });

    var earth_mesh = new THREE.Mesh(earth_geo, earth_mat)
    all_mesh.add(earth_mesh)*!/


    var geometry = new THREE.SphereGeometry(radius, segments, segments);
    var material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: true,
        transparent: true
    });
    var sphere = new THREE.Mesh(geometry, material);
    all_mesh.add(sphere);

    //Draw the GeoJSON
    $.getJSON("./assets/data/test_geojson/countries_states.geojson", function(data) {
        drawThreeGeo(data, radius, 'sphere', {
            color: 0x80FF80
        }, all_mesh);
    });

    $.getJSON("./assets/data/test_geojson/rivers.geojson", function(data) {
        drawThreeGeo(data, radius, 'sphere', {
            color: 0x8080FF
        }, all_mesh);
    });

/!*    // clouds

    var materialClouds = new THREE.MeshLambertMaterial( {

        map: textureLoader.load( "./assets/img/earth/earth_clouds_1024.png" ),
        transparent: true

    } );

    meshClouds = new THREE.Mesh(earth_geo, materialClouds );
    meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
    meshClouds.rotation.z = tilt;
    all_mesh.add( meshClouds );

    // moon

    var materialMoon = new THREE.MeshPhongMaterial( {

        map: textureLoader.load( "./assets/img/earth/moon_1024.jpg" )

    } );

    meshMoon = new THREE.Mesh(earth_geo, materialMoon );
    meshMoon.position.set( radius * 4, 0, 0 );
    meshMoon.scale.set( moonScale, moonScale, moonScale );
    all_mesh.add( meshMoon );

    // stars

    var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

    for ( i = 0; i < 250; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        starsGeometry[ 0 ].vertices.push( vertex );

    }

    for ( i = 0; i < 1500; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        starsGeometry[ 1 ].vertices.push( vertex );

    }

    var stars;
    var starsMaterials = [
        new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
    ];

    for ( i = 10; i < 30; i ++ ) {

        stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar( i * 10 );

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        all_mesh.add( stars );

    }*!/


    controls = new THREE.TrackballControls(camera,renderer.domElement);
    // controls.rotateSpeed = 2;
    // controls.noZoom = false;
    // controls.noPan = true;
    // controls.staticMoving = false;
    // controls.minDistance = 0.5;
    // controls.maxDistance = 3;

}*/

/*
 * 生成曲线的控制点
 * @param float radius
 * @param start array
 * @param end array
 * */

function generateOnePathPoints(radius, start, end) {

    var start_lng = start[0];
    var start_lat = start[1];

    var end_lng = end[0];
    var end_lat = end[1];

    var max_height = Math.random() * lineHeight;   //每条线路高度随机

    var points = [];  //三维点数组

    var spline_control_points = 8;    //样条点的控制数

    for (var i = 0; i < spline_control_points + 1; i++) {

        var arc_angle = i * 180.0 / spline_control_points;  //每条线路圆弧的弧度

        var arc_radius = radius + (Math.sin(arc_angle * Math.PI / 180.0)) * max_height;  //每条线路圆弧的半径

        var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);  //获取到二维经纬坐标点，待研究

        var pos = xyzFromLatLng(latlng.lat, latlng.lng, arc_radius);  //经纬度点转化三维坐标点

        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));

    }

    var spline = new THREE.CatmullRomCurve3(points);   //实际传入三个关键点vector3数组元素，上中下

    spline_curves.push(spline);  //飞线路径数组


    var arc_length = spline.getLength();

    trail_flight_distance.push(arc_length);   //飞线圆弧长度


}
/*
* @param string radius
* */
function generateAllPathsPoints(radius) {   //所有线路

    //国内航班
    PATH_DATA2.forEach(function (line) {
        generateOnePathPoints(radius, line.start, line.end)    //每一条线路
    })

/*    //国际航班
PATH_DATA.forEach(function (line) {
        generateOnePathPoints(radius, line.start, line.end)    //每一条线路
    })*/


   trail_path_count = spline_curves.length   //飞线路径数目赋值

}

function xyzFromLatLng(lat, lng, radius) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (360 - lng) * Math.PI / 180;

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
    };
}

function latlngInterPoint(lat1, lng1, lat2, lng2, offset) {
    lat1 = lat1 * Math.PI / 180.0;
    lng1 = lng1 * Math.PI / 180.0;
    lat2 = lat2 * Math.PI / 180.0;
    lng2 = lng2 * Math.PI / 180.0;

    const d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
    const A = Math.sin((1 - offset) * d) / Math.sin(d);
    const B = Math.sin(offset * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
    const lng = Math.atan2(y, x) * 180 / Math.PI;

    return {
        lat: lat,
        lng: lng
    };
}

function createLines() {

    var strokeMap = texture.stroke;

    for (var i = 0; i < trail_path_count; i++) {

        var ml = new THREE.MeshLine();


        ml.setGeometry(trail_points[i], function (p) {
            return p
        });

        var material = new THREE.MeshLineMaterial({
             useMap: true,
             map: strokeMap,
             color: new THREE.Color(colorArray[1]),
             opacity: 0.9,
             resolution: resolution,
             sizeAttenuation: false,
             lineWidth: lineWidth / 2,
             near: camera.near,
             far: camera.far,
             depthTest: true,
             transparent: true
        });

        var trail = new THREE.Mesh(ml.geometry, material);
        ml_arr.push(ml)


        all_mesh.add(trail);

    }

}

function flyShape() {

    // 飞机形状
    var planeShape = new THREE.Shape();
    planeShape.moveTo(0, 0);
    planeShape.lineTo(0.2, -0.2);
    planeShape.lineTo(0.2, -1.3);
    planeShape.lineTo(1.6, -2.7);
    planeShape.lineTo(1.6, -3);
    planeShape.lineTo(0.2, -2.1);
    planeShape.lineTo(0.2, -3);
    planeShape.lineTo(0.5, -3.4);
    planeShape.lineTo(0.5, -3.7);
    planeShape.lineTo(0, -3.3);
    planeShape.lineTo(-0.5, -3.7);
    planeShape.lineTo(-0.5, -3.4);
    planeShape.lineTo(-0.2, -3);
    planeShape.lineTo(-0.2, -2.1);
    planeShape.lineTo(-1.6, -3);
    planeShape.lineTo(-1.6, -2.7);
    planeShape.lineTo(-0.2, -1.3);
    planeShape.lineTo(-0.2, -0.2);
    var planeGeometry = new THREE.ShapeGeometry(planeShape);
    // 飞机材质
    var planeMaterial = new THREE.MeshPhongMaterial({color: 0x0FB4DD, side: THREE.DoubleSide, depthTest: true});

    // 添加飞机
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    /*    // 旋转
    plane.rotation.z = THREE.Math.degToRad(item.ang);
    // 定位
    var position = getPosition(item.lng, item.lat, 5);
    plane.position.set(position.x, position.y, position.z);*/
    // 显示/隐藏
    // plane.visible = false;
    // 保存
    // planeMarkers[item.anum] = plane;
    // 添加到场景
    all_mesh.add(plane);
    // 绘制历史轨迹

}

function getCurvePoints() {

    for (var i = 0; i < trail_path_count; i++) {

        var vertices = spline_curves[i].getPoints(trail_path_points_num)  //获取飞线轨迹点数目，初始值100个点
        var points = new Float32Array(trail_points_num * 3)
        for (var j = 0; j < trail_points_num; j++) {
            // 起始阶段全部放置在初始位置
            points[j * 3 + 0] = vertices[0].x;
            points[j * 3 + 1] = vertices[0].y;
            points[j * 3 + 2] = vertices[0].z;
        }

        trail_paths.push(vertices)

        trail_points.push(points)


    }

}

function setFlightTimes(i, interval) {
    interval = interval ? interval : 0;
    var duration = trail_flight_distance[i] * 8000
    var start_time = Date.now() + Math.random() * 1500 + i * 1000 + interval
    flight_start_time[i] = start_time;
    flight_end_time[i] = start_time + duration;
}

// 线性缓动计算
function easeLinear(t, d) {
    return t / d
}

function update_flights() {

    //移动轨迹的飞线
    timer += clock.getDelta();

    var final_ease_val = (trail_path_points_num + trail_points_num) / trail_path_points_num

    for (var i = 0; i < trail_path_count; ++i) {
        if (Date.now() > flight_start_time[i]) {
            var ease_val = easeLinear(Date.now() - flight_start_time[i], flight_end_time[i] - flight_start_time[i])
            if (ease_val >= final_ease_val) {
                setFlightTimes(i, 8000)
                ease_val = 0
            }

            var pointIndex = ~~(trail_path_points_num * ease_val)
            if (pointIndex > trail_path_points_num) {
                var delta = trail_path_points_num + trail_points_num - pointIndex;
                for (var j = 0; j < trail_points_num; j++) {

                    if (j < delta) {

                        var k = trail_path_points_num - 1 - (delta - j);
                        trail_points[i][j * 3 + 0] = trail_paths[i][k].x
                        trail_points[i][j * 3 + 1] = trail_paths[i][k].y
                        trail_points[i][j * 3 + 2] = trail_paths[i][k].z
                    } else {
                        var k = trail_path_points_num - 1;
                        trail_points[i][j * 3 + 0] = trail_paths[i][k].x
                        trail_points[i][j * 3 + 1] = trail_paths[i][k].y
                        trail_points[i][j * 3 + 2] = trail_paths[i][k].z
                    }
                }
            } else {
                var delta = pointIndex - trail_points_num
                for (var j = 0; j < trail_points_num; j++) {
                    var k = (j + delta >= 0) ? (j + delta) : 0
                    trail_points[i][j * 3 + 0] = trail_paths[i][k].x
                    trail_points[i][j * 3 + 1] = trail_paths[i][k].y
                    trail_points[i][j * 3 + 2] = trail_paths[i][k].z
                }
            }

            ml_arr[i].setGeometry(trail_points[i], function (p) {
                return p
            });
        }
    }

}

function animate() {

        requestAnimationFrame(animate);
        render();
    }
function render() {
        camera.lookAt(scene.position);
       // update_flights()
        // 平行光始终从相机位置照向地球
        controls.update();
        renderer.render(scene, camera);
    }



