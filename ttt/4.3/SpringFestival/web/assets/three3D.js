
var container, stats;
var camera, scene, renderer;
var group;
var mouseX = 0, mouseY = 0;

var cameraControls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;



init();
animate();


function init() {

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
  /*     canvas.width =2048;
       canvas.height = 1024;
    //确定浏览器是否支持canvas元素
    if (canvas.getContext) {
        var context = canvas.getContext("3d");
    }*/
       console.log(canvas);

    html2canvas(canvas).then(function(canvas) {

        //取得图像数据的URL
        var imgURL = canvas.toDataURL("image/png");

        //显示图像
        var image = document.createElement("img");
        image.src = imgURL;
        //document.body.appendChild(image);
       // image.width =2048;
       // image.height = 1024;

        textureMap = new THREE.CanvasTexture(canvas);
        //textureMap.repeat.set( 1000, 1000 );
        textureMap.wrapS = THREE.RepeatWrapping;
        textureMap.wrapT = THREE.RepeatWrapping;

        var geometry = new THREE.SphereGeometry( 200, 20, 20 );
        var material = new THREE.MeshBasicMaterial( { map: textureMap, overdraw: 0.5 } );
       // material.map.needsUpdate = true;


        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );
   });

    // earth

    var loader = new THREE.TextureLoader();
    loader.load( './assets/img/land_mask_LH_all.png', function ( texture ) {

        var geometry = new THREE.SphereGeometry( 200, 20, 20 );

        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
        var mesh = new THREE.Mesh( geometry, material );
        group.add( mesh );

    } );

    // shadow

   /* var canvas = document.createElement( 'canvas' );
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
*/
    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    /*cameraControls.target.set( 0, -400, 0 );
    cameraControls.maxDistance = 400;
    cameraControls.minDistance = 10;
    cameraControls.update();*/
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

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}

//

function animate() {

    requestAnimationFrame( animate );
    cameraControls .update();
    render();
   // stats.update();


}

function render() {

    //camera.position.x += ( mouseX - camera.position.x ) * 0.05;
   // camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
    camera.lookAt( scene.position );

   // group.rotation.y -= 0.005;

    renderer.render( scene, camera );


}