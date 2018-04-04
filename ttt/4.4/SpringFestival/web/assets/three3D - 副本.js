
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

var mapSize = {
    width: 4096,
    height: 2048
};
var mapCanvas, mapTexture;


init();
animate();

// 初始化echarts地图
function initMap() {

    mapCanvas = document.createElement( 'canvas' );
    mapCanvas.width = mapSize.width;
    mapCanvas.height = mapSize.height;

    mapTexture = new THREE.Texture( mapCanvas );

    var chart = echarts.init ( mapCanvas );

    option = {
        visualMap: {
            show: false,
            min: 0,
            max: 1000000,
            text:[ 'High', 'Low' ],
            realtime: false,
            calculable: true,
            inRange: {
                color: [ 'lightskyblue', 'yellow', 'orangered' ]
            }
        },
        backgroundColor: 'rgb( 255, 255, 255 )',
        series: [
            {
                type: 'map',
                mapType: 'world',
                roam: true,
                aspectScale: 1,
                layoutCenter: [ '50%', '50%' ],
                layoutSize: 4096,
                itemStyle:{
                    emphasis:{ label: { show: true } }
                },
                data: population    // from population.js
            }
        ]
    };

    chart.setOption( option );
    mapTexture.needsUpdate = true;

    // 选中或移出时才更新贴图
    // 内存向显存上传数据很慢，应该尽量减少贴图更新
    chart.on( 'mouseover', function () {
        mapTexture.needsUpdate = true;
    } );

    chart.on( 'mouseout', function () {
        mapTexture.needsUpdate = true;
    } );

}

// 初始化three.js场景
function initScene() {

    var container = document.getElementById( 'container' );

    // 场景
    scene = new THREE.Scene();

    // 相机
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = -500;

    // 渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x333333 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    // 控制器
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.rotateSpeed = 0.4;

   /* cameraControls.target.set( 0, -400, 0 );
    cameraControls.maxDistance = 400;
    cameraControls.minDistance = 10;
    cameraControls.update();
    cameraControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    cameraControls.dampingFactor = 0.25;

    cameraControls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning

    cameraControls.minDistance = 100;
    cameraControls.maxDistance = 500

    cameraControls.maxPolarAngle = Math.PI / 2;*/


    // 平行光
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    scene.add( directionalLight );

    // 环境光
    var light = new THREE.AmbientLight( 0x202020 );
    scene.add( light );

    // 地球
    var earthGeometry = new THREE.SphereBufferGeometry( 200, 36, 36 );
    var earthMaterial = new THREE.MeshLambertMaterial( { map: mapTexture, color: 0xffffff } );
    earth = new THREE.Mesh( earthGeometry, earthMaterial );

 /*   var loader = new THREE.TextureLoader();
    loader.load( './assets/img/land_mask_LH_all.png', function ( texture ) {

        var geometry = new THREE.SphereGeometry( 200, 20, 20 );

        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );

    } );*/

    scene.add( earth );

}

function init() {

    initMap();

    initScene();

    window.addEventListener( 'resize', onWindowResize, false );

    container.addEventListener( 'mousemove', onMouseMove, false );

}

/*function init() {

    container = document.getElementById( 'mapThree' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.z = 500;
    //camera.position.y = 100;


    scene = new THREE.Scene();
   // scene.background = new THREE.Color( 0xffffff );

    group = new THREE.Group();
    scene.add( group );


    //var map = document.getElementById( 'map' );

    var canvas = document.getElementsByTagName('canvas')[0];
  /!*     canvas.width =2048;
       canvas.height = 1024;
    //确定浏览器是否支持canvas元素
    if (canvas.getContext) {
        var context = canvas.getContext("3d");
    }*!/
       console.log(canvas);

   // html2canvas(canvas).then(function(canvas) {

      /!*  //取得图像数据的URL
        var imgURL = canvas.toDataURL("image/png");

        //显示图像
        var image = document.createElement("img");
        image.src = imgURL;
        //document.body.appendChild(image);
       // image.width =2048;
       // image.height = 1024;*!/

     /!*   textureMap = new THREE.CanvasTexture(canvas);
        //textureMap.repeat.set( 1000, 1000 );
        textureMap.wrapS = THREE.RepeatWrapping;
        textureMap.wrapT = THREE.RepeatWrapping;

        var geometry = new THREE.SphereGeometry( 200, 20, 20 );
        var material = new THREE.MeshBasicMaterial( { map: textureMap, overdraw: 0.5 } );
       // material.map.needsUpdate = true;


        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );*!/
 //   });



    // earth

    var loader = new THREE.TextureLoader();
    loader.load( './assets/img/land_mask_LH_all.png', function ( texture ) {

        var geometry = new THREE.SphereGeometry( 200, 20, 20 );

        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );

    } );

    // shadow

   /!* var canvas = document.createElement( 'canvas' );
    canvas.width = 128;
    canvas.height = 128;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
    gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    var texture = new THREE.CanvasTexture( canvas );

    var geometry = new THREE.PlaneBufferGeometry( 300, 300, 3, 3 );
    var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = - 250;
    mesh.rotation.x = - Math.PI / 2;
    group.add( mesh );
*!/
    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    /!*cameraControls.target.set( 0, -400, 0 );
    cameraControls.maxDistance = 400;
    cameraControls.minDistance = 10;
    cameraControls.update();*!/
    cameraControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    cameraControls.dampingFactor = 0.25;

    cameraControls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning

    cameraControls.minDistance = 100;
    cameraControls.maxDistance = 500

    cameraControls.maxPolarAngle = Math.PI / 2;

    //stats = new Stats();
    //container.appendChild( stats.dom );

   // document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    window.addEventListener( 'resize', onWindowResize, false );

}*/

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

function animate() {

    requestAnimationFrame( animate )

    controls.update();

    render();
   // stats.update();
}

function render() {

    // camera.lookAt( scene.position );
    // 平行光始终从相机位置照向地球
    directionalLight.position.copy( camera.position );

    renderer.render( scene, camera );


}