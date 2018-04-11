
var container, stats;
var camera, scene, renderer;
var group;
var mouseX = 0, mouseY = 0;

var controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var directionalLight;

var earth;

//three3D航行线扩展

var isLoading = true;
var texture = {
    colorMap: null,
    bumpMap: null,
    stroke: null,
    specMap: null

}
var dom = document.querySelector('#container')
var domWidth = dom.offsetWidth;
var domHeight = dom.offsetHeight;

var lineColor = 0x5dd8d8;
var lineWidth = 10;
var lineHeight = 0.13;


//飞线路径数组
var spline_curves = []
//飞线长度数组
var trail_flight_distance = []
//每次飞行动画起始结束时间
var flight_start_time = []
var flight_end_time = []

var trail_points = []

var trail_paths = []
var ml_arr = []

var clock = new THREE.Clock();
var resolution = new THREE.Vector2(domWidth, domHeight);

/* 显示控制变量*/

var radius = 0.5;
var segments = 64;


//飞线点数量
var trail_points_num = 400;
//飞线轨迹点数量
var trail_path_points_num = 1200;
// 飞线路径数量
var trail_path_count = 0;
var timer = 0;

//加载状态

//显示比例
var aspect = domWidth / domHeight;



init();
window.addEventListener( 'resize', onWindowResize, false );
animate();

// 初始化three.js场景
function init() {


    var container = document.getElementById( 'container' );

    // 场景
    scene = new THREE.Scene();

    // 相机
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1000 );
    camera.position.z = -500;


    // 渲染器
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor( 0x000000 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );


    // 控制器
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5;
    controls.update();
    //controls.target.set( 0, 20, 0 );
   // controls.noZoom = false;
    //controls.noPan = true;
    //controls.staticMoving = true;
    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning


    //mesh容器
    all_mesh = new THREE.Object3D();
    all_mesh.rotateX( - Math.PI / 5 );
    all_mesh.rotateY( - Math.PI /15 );
    all_mesh.scale.set( 1.2, 1.2, 1.2 );

    scene.add(all_mesh)


    // 平行光
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    directionalLight.position.set(5, 3, 5);
    scene.add( directionalLight );

    // 环境光
    var light = new THREE.AmbientLight(0x777777);
    scene.add( light );


    loadTexture(function () {
        initEarth();
    })

    function loadTexture(cb) {
        var loader = new THREE.TextureLoader();
        loader.load('./assets/img/earth/land_mask_LH_all.png', function (colorMap) {
            loader.load('./assets/img/earth/bump.jpg', function (bumpMap) {
                loader.load('./assets/img/earth/earthspec.jpg', function (smap) {
                    loader.load('./assets/img/earth/stroke.png', function (stroke) {
                        isLoading = false;
                        texture = {
                            colorMap: colorMap,
                            bumpMap: bumpMap,
                            specMap: smap,
                            stroke: stroke
                        }
                        cb()
                    });
                })
            })
        })
    }
    function initEarth(){
        // 地球
        var earthGeometry = new THREE.SphereBufferGeometry( 200, 36, 36 );

        var earthMaterial = new THREE.MeshPhongMaterial( {/* map: mapTexture, color: 0xffffff,overdraw: 0.5*/ /*,wireframe: true, transparent: true */} );
        earthMaterial.map = texture.colorMap
        earthMaterial.specularMap = texture.specMap
        earthMaterial.bumpMap = texture.bumpMap
        earthMaterial.bumpScale = 0.1
        earthMaterial.specular = new THREE.Color('#2e2e2e');

        earth = new THREE.Mesh( earthGeometry, earthMaterial );
        all_mesh.add( earth );

    }

    /* 生成标记点和曲线*/

    generateAllPathsPoints(radius);
    getCurvePoints();
    createLines();

    for (var i = 0; i < trail_path_count; i++) {
        setFlightTimes(i);
    }


}


function onWindowResize() {

   /* windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;*/

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

  /*  mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );*/

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );       // 通过鼠标坐标和相机位置构造射线

    var intersected = raycaster.intersectObject( earth );   // 获取射线和地球的相交点

    if ( intersected && intersected.length > 0 ) {

        // 根据射线相交点的uv反算出在canvas上的坐标
        var x = intersected[ 0 ].uv.x * mapSize.width;
        var y = mapSize.height - intersected[ 0 ].uv.y * mapSize.height;

        // 在mapCanvas上模拟鼠标事件，这里或许有更好的方法
        var virtualEvent = document.createEvent( 'MouseEvents' );
        virtualEvent.initMouseEvent( 'mousemove', false, true, document.defaultView, 1, x, y, x, y,false, false, false, false, 0, null );
        mapCanvas.dispatchEvent(virtualEvent);

    }

}

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

    var max_height = Math.random() * lineHeight;

    var points = [];

    var spline_control_points = 8;

    for (var i = 0; i < spline_control_points + 1; i++) {

        var arc_angle = i * 180.0 / spline_control_points;

        var arc_radius = radius + (Math.sin(arc_angle * Math.PI / 180.0)) * max_height;

        var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);

        var pos = xyzFromLatLng(latlng.lat, latlng.lng, arc_radius);

        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));

    }

    var spline = new THREE.CatmullRomCurve3(points);

    spline_curves.push(spline);    //飞线路径

    var arc_length = spline.getLength();

    trail_flight_distance.push(arc_length);    //飞仙长度

}

/*
* @param string radius
* */

//生成所有航线数据 line数组里面存放线对象
function generateAllPathsPoints(radius) {

    PATH_DATA.forEach(function (line) {
       //生成每一条航线
        generateOnePathPoints(radius,line.start, line.end)
    })


    trail_path_count = spline_curves.length    //飞行路径数目

}

//坐标转化
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

    var strokeMap = texture.stroke

    for (var i = 0; i < trail_path_count; i++) {

        var ml = new THREE.MeshLine();

        ml.setGeometry(trail_points[i], function (p) {
            return p
        });

        var material = new THREE.MeshLineMaterial({
            useMap: true,
            map: strokeMap,
            color: new THREE.Color(lineColor),
            opacity: 0.7,
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

function getCurvePoints() {


    for (var i = 0; i < trail_path_count; i++) {

        var vertices = spline_curves[i].getPoints(trail_path_points_num)
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

// 线性缓动计算
function easeLinear(t, d) {
    return t / d
}

function setFlightTimes(i, interval) {
    interval = interval ? interval : 0;
    var duration = trail_flight_distance[i] * 8000
    var start_time = Date.now() + Math.random() * 1500 + i * 1000 + interval
    flight_start_time[i] = start_time;
    flight_end_time[i] = start_time + duration;
}

function update_flights() {

    //移动轨迹的飞线

    timer += clock.getDelta();

    var final_ease_val = (trail_path_points_num + trail_points_num) / trail_path_points_num

    for (var i = 0; i < trail_path_count; ++i) {
        if (Date.now() > flight_start_time[i]) {
            var ease_val = easeLinear(Date.now() - flight_start_time[i], flight_end_time[i] - flight_start_time[i])
            if (ease_val >= final_ease_val) {
                setFlightTimes(i, 5000)
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

    requestAnimationFrame( animate )

  /*  if (isLoading) {
        return false
    } else {*/
       // all_mesh.rotation.y += 0.005
        update_flights()

        controls.update();
        render();
        // stats.update();
   // }
}

function render() {

   camera.lookAt( scene.position );
    //camera.lookAt( new THREE.Vector3( 30, 300, 0 ) );

    // 平行光始终从相机位置照向地球
    directionalLight.position.copy( camera.position );

    renderer.render( scene, camera );


}
