
var camera, scene, renderer, controls;
var isLoading = true;
var texture = {
    colorMap: null,
    bumpMap: null,
    stroke: null,
    specMap: null
}

var dom = document.getElementById( 'container' );
var domWidth = dom.offsetWidth
var domHeight = dom.offsetHeight

var lineColor = 0x5dd8d8;
var colorArray = [ new THREE.Color( 0xff0080 ), new THREE.Color( 0xffffff ), new THREE.Color( 0x8000ff ) ];
var lineWidth = 10;
var lineHeight = 0.013;

var timer = 0;


init();
animate();


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
loadTexture(function () {
    initEarth()
})
function init() {

   /*
   航班，机场，路线数据结构模拟
   {
        airlineFields:["name", "country"] 航空领域
        airportsFields:["name", "city", "country", "longitude", "latitude"]   机场领域
        airlines:[["Air France", "France"], ["easyJet", "United Kingdom"], ["Southwest Airlines", "United States"],…] 航班
        airports:[["Goroka", "Goroka", "Papua New Guinea", 145.391881, -6.081689],…]   机场
        routes:[[9, 4242, 3777], [9, 4242, 3653], [9, 3619, 3571], [9, 3911, 3571], [9, 3911, 3385], [9, 3911, 3731],…]  路线
    }
    */

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
    var resolution = new THREE.Vector2(domWidth, domHeight);

    /*
     * 显示控制变量
     * */

    var radius = 0.5;
    var segments = 64;


    //飞线点数量
    var trail_points_num = 400;
    //飞线轨迹点数量
    var trail_path_points_num = 1200;
    // 飞线路径数量
    var trail_path_count = 0;

    //加载状态

    //显示比例
    var aspect = domWidth / domHeight

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(domWidth, domHeight);
    this.dom.append(renderer.domElement);

    //SCENE
    scene = new THREE.Scene();

    //包裹
    var all_mesh = new THREE.Object3D()

    /*
     * 调整中国位置
     * */
    all_mesh.rotation.x = -0.6
    all_mesh.rotation.y = -0.4
    all_mesh.rotation.z = 0.2
    all_mesh.scale.set( 3, 3, 3 );

    //
    scene.add(all_mesh)

    // 摄像机
    camera = new THREE.PerspectiveCamera(60, aspect, 0.01, 1000);
    camera.position.z = -500;

    //环境光
    scene.add(new THREE.AmbientLight(0xffffff));

    //
    var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
    light1.position.set(5, 3, 5);
    scene.add(light1);

    //
    var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
    light2.position.set(5, 3, -5);
    scene.add(light2);


    // 地球
    var earth_geo = new THREE.SphereGeometry(radius, segments, segments);
    var earth_mat = new THREE.MeshPhongMaterial({
        map:texture.colorMap,
        specularMap: texture.specMap,
        bumpMap:texture.bumpMap,
        bumpScale:0.1,
        specular: new THREE.Color('#2e2e2e')
    });

    var earth_mesh = new THREE.Mesh(earth_geo, earth_mat)
    all_mesh.add(earth_mesh)


    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2;
    controls.noZoom = false;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.minDistance = 0.75;
    controls.maxDistance = 3;

    /*
     * 生成标记点和曲线
     * */
    generateAllPathsPoints(radius)   //主要作用飞线路径的生成
    getCurvePoints()     //飞线路径上点的控制
    createLines()

    for (var i = 0; i < trail_path_count; i++) {
        setFlightTimes(i);
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
            generateOnePathPoints(radius,line.start, line.end)    //每一条线路
        })

        //国际航班
        PATH_DATA.forEach(function (line) {
            generateOnePathPoints(radius,line.start, line.end)    //每一条线路
        })


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

    function  flyShape(){

        // 飞机形状
        var planeShape = new THREE.Shape();
        planeShape.moveTo( 0, 0);
        planeShape.lineTo(0.2, -0.2);
        planeShape.lineTo(0.2, -1.3);
        planeShape.lineTo(1.6,-2.7);
        planeShape.lineTo(1.6,-3);
        planeShape.lineTo(0.2, -2.1);
        planeShape.lineTo(0.2, -3);
        planeShape.lineTo(0.5, -3.4);
        planeShape.lineTo(0.5, -3.7);
        planeShape.lineTo(0, -3.3);
        planeShape.lineTo(-0.5, -3.7);
        planeShape.lineTo(-0.5, -3.4);
        planeShape.lineTo(-0.2, -3);
        planeShape.lineTo(-0.2, -2.1);
        planeShape.lineTo(-1.6,-3);
        planeShape.lineTo(-1.6,-2.7);
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
    //camera.lookAt( new THREE.Vector3( 30, 300, 0 ) );

    if (isLoading) {
        return false
    } else {
        //all_mesh.rotation.y += 0.005
        update_flights()
        controls.update();
        renderer.render(scene, camera);

    }
}



