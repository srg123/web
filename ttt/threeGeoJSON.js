/* Draw GeoJSON

Iterates through the latitude and longitude values, converts the values to XYZ coordinates,
and draws the geoJSON geometries.

*/

function drawThreeGeo(json, radius, shape, materalOptions, container) {
    container = container || window.scene;

    var x_values = [];
    var y_values = [];
    var z_values = [];

    var json_geom = createGeometryArray(json);
    //An array to hold the feature geometries.
    var convertCoordinates = getConversionFunctionName(shape);
    //Whether you want to convert to spherical or planar coordinates.
    var coordinate_array = [];
    //Re-usable array to hold coordinate values. This is necessary so that you can add
    //interpolated coordinates. Otherwise, lines go through the sphere instead of wrapping around.

    for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {

        if (json_geom[geom_num].type == 'Point') {
            convertCoordinates(json_geom[geom_num].coordinates, radius);
            drawParticle(y_values[0], z_values[0], x_values[0], materalOptions);

        } else if (json_geom[geom_num].type == 'MultiPoint') {
            for (var point_num = 0; point_num < json_geom[geom_num].coordinates.length; point_num++) {
                convertCoordinates(json_geom[geom_num].coordinates[point_num], radius);
                drawParticle(y_values[0], z_values[0], x_values[0], materalOptions);
            }

        } else if (json_geom[geom_num].type == 'LineString') {
            coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates);

            for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                convertCoordinates(coordinate_array[point_num], radius);
            }
            drawLine(y_values, z_values, x_values, materalOptions);

        } else if (json_geom[geom_num].type == 'Polygon') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

                for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                    convertCoordinates(coordinate_array[point_num], radius);
                }
                drawLine(y_values, z_values, x_values, materalOptions);
                //drawShape(x_values, y_values,z_values, materalOptions);
            }

        } else if (json_geom[geom_num].type == 'MultiLineString') {
            for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates.length; segment_num++) {
                coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[segment_num]);

                for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                    convertCoordinates(coordinate_array[point_num], radius);
                }
                drawLine(y_values, z_values, x_values, materalOptions);
            }

        } else if (json_geom[geom_num].type == 'MultiPolygon') {
            for (var polygon_num = 0; polygon_num < json_geom[geom_num].coordinates.length; polygon_num++) {
                for (var segment_num = 0; segment_num < json_geom[geom_num].coordinates[polygon_num].length; segment_num++) {
                    coordinate_array = createCoordinateArray(json_geom[geom_num].coordinates[polygon_num][segment_num]);

                    for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
                        convertCoordinates(coordinate_array[point_num], radius);
                    }
                    drawLine(y_values, z_values, x_values, materalOptions);
                    //drawShape(x_values, y_values,z_values, materalOptions);
                }
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
    }

    function createGeometryArray(json) {
        var geometry_array = [];

        if (json.type == 'Feature') {
            geometry_array.push(json.geometry);
        } else if (json.type == 'FeatureCollection') {
            for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
                geometry_array.push(json.features[feature_num].geometry);
            }
        } else if (json.type == 'GeometryCollection') {
            for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
                geometry_array.push(json.geometries[geom_num]);
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
        //alert(geometry_array.length);
        return geometry_array;
    }

    function getConversionFunctionName(shape) {
        var conversionFunctionName;

        if (shape == 'sphere') {
            conversionFunctionName = convertToSphereCoords;
        } else if (shape == 'plane') {
            conversionFunctionName = convertToPlaneCoords;
        } else {
            throw new Error('The shape that you specified is not valid.');
        }
        return conversionFunctionName;
    }

    function createCoordinateArray(feature) {
        //Loop through the coordinates and figure out if the points need interpolation.
        var temp_array = [];
        var interpolation_array = [];

        for (var point_num = 0; point_num < feature.length; point_num++) {
            var point1 = feature[point_num];
            var point2 = feature[point_num - 1];

            if (point_num > 0) {
                if (needsInterpolation(point2, point1)) {
                    interpolation_array = [point2, point1];
                    interpolation_array = interpolatePoints(interpolation_array);

                    for (var inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
                        temp_array.push(interpolation_array[inter_point_num]);
                    }
                } else {
                    temp_array.push(point1);
                }
            } else {
                temp_array.push(point1);
            }
        }
        return temp_array;
    }

    function needsInterpolation(point2, point1) {
        //If the distance between two latitude and longitude values is
        //greater than five degrees, return true.
        var lon1 = point1[0];
        var lat1 = point1[1];
        var lon2 = point2[0];
        var lat2 = point2[1];
        var lon_distance = Math.abs(lon1 - lon2);
        var lat_distance = Math.abs(lat1 - lat2);

        if (lon_distance > 5 || lat_distance > 5) {
            return true;
        } else {
            return false;
        }
    }

    function interpolatePoints(interpolation_array) {
        //This function is recursive. It will continue to add midpoints to the
        //interpolation array until needsInterpolation() returns false.
        var temp_array = [];
        var point1, point2;

        for (var point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
            point1 = interpolation_array[point_num];
            point2 = interpolation_array[point_num + 1];

            if (needsInterpolation(point2, point1)) {
                temp_array.push(point1);
                temp_array.push(getMidpoint(point1, point2));
            } else {
                temp_array.push(point1);
            }
        }

        temp_array.push(interpolation_array[interpolation_array.length - 1]);

        if (temp_array.length > interpolation_array.length) {
            temp_array = interpolatePoints(temp_array);
        } else {
            return temp_array;
        }
        return temp_array;
    }

    function getMidpoint(point1, point2) {
        var midpoint_lon = (point1[0] + point2[0]) / 2;
        var midpoint_lat = (point1[1] + point2[1]) / 2;
        var midpoint = [midpoint_lon, midpoint_lat];

        return midpoint;
    }

    function convertToSphereCoords(coordinates_array, sphere_radius) {
        var lon = coordinates_array[0];
        var lat = coordinates_array[1];

        x_values.push(Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180) * sphere_radius);
        y_values.push(Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180) * sphere_radius);
        z_values.push(Math.sin(lat * Math.PI / 180) * sphere_radius);
    }

    function convertToPlaneCoords(coordinates_array, radius) {
        var lon = coordinates_array[0];
        var lat = coordinates_array[1];

        z_values.push((lat / 180) * radius);
        y_values.push((lon / 180) * radius);
    }

    function drawParticle(x, y, z, options) {
        var particle_geom = new THREE.Geometry();
        particle_geom.vertices.push(new THREE.Vector3(x, y, z));

        var particle_material = new THREE.ParticleSystemMaterial(options);

        var particle = new THREE.ParticleSystem(particle_geom, particle_material);
        container.add(particle);

        clearArrays();
    }

    function drawLine(x_values, y_values, z_values, options) {

      /*  // Line
        var points = [];
        createVertexForEachPoint2(points, x_values, y_values,z_values);

        var spline = new THREE.CatmullRomCurve3(points);

        var points = spline.getPoints();
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices = points;
        lineGeometry.colors = new THREE.Color( 0x88aaff );

        //for ( i = 0; i < points.length * n_sub; i ++ ) {

           // index = i / ( points.length * n_sub );
          //  position = spline.getPoint( index ); //细分数为20，从spline曲线上获取系列顶点数据

            //lineGeometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
           // colors[ i ] = new THREE.Color( 0x88aaff );

      //  }

        //lineGeometry.colors = colors;

        var line_material = new THREE.LineBasicMaterial(options);
        var line = new THREE.Line( lineGeometry, line_material);
        container.add(line);*/



          var line_geom = new THREE.Geometry();
          createVertexForEachPoint(line_geom, x_values, y_values, z_values);

          var line_material = new THREE.LineBasicMaterial(options);
          var line = new THREE.Line(line_geom, line_material);
          container.add(line);


        //var californiaPts = [];

        //createVertexForEachPoint2(californiaPts, x_values, y_values,z_values);

        //for( var i = 0; i < californiaPts.length; i ++ ) californiaPts[ i ].multiplyScalar( 0.25 );

      /*  var line_geom = new THREE.Geometry();
        createVertexForEachPoint(line_geom, x_values, y_values, z_values);

        var shape = new THREE.Shape(line_geom.vertices );

        var line_geom = shape.createPointsGeometry();
        line_geom.vertices.push( line_geom.vertices[ 0 ].clone() );

       var material = new THREE.LineBasicMaterial( { linewidth: 10, color: 0x9ac0eb, transparent: true } );

        var line = new THREE.Line( line_geom, material );
        //line.position.set( x, y, z );
       // line.rotation.set( rx, ry, rz );
        //line.scale.set( s, s, s );
        container.add( line );


        var geometry = new THREE.ShapeGeometry( shape );
        var material = new THREE.MeshBasicMaterial( { color: 0xa142b, overdraw: 0.5,side:THREE.DoubleSide} );

        var mesh = new THREE.Mesh( geometry, material );
        //mesh.position.set( x, y, z );
        //mesh.rotation.set( rx, ry, rz );
        //mesh.scale.set( s, s, s );
        container.add( mesh );
*/
        clearArrays();
    }

    function drawShape(x_values, y_values,z_values, options) {


        var loader = new THREE.TextureLoader();
        texture = loader.load( "./lib/UV_Grid_Sm.jpg" );

        var californiaPts = [];

        createVertexForEachPoint2(californiaPts, x_values, y_values,z_values);

        for( var i = 0; i < californiaPts.length; i ++ ) californiaPts[ i ].multiplyScalar( 0.25 );

        var californiaShape = new THREE.Shape( californiaPts );
        // Circle

     /*   var triangleShape = new THREE.Shape();
        triangleShape.moveTo(  80, 20 );
        triangleShape.lineTo(  40, 80 );
        triangleShape.lineTo( 120, 80 );
        triangleShape.lineTo(  80, 20 ); // close path*/


        var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

        // addShape( shape, color, x, y, z, rx, ry,rz, s );
        addShape( californiaShape,  extrudeSettings, 0xf08000, 0, 0, 0, 0, 0, 0, 3 );

       // addShape(triangleShape,  extrudeSettings, 0xf08000, -300, -100, 0, 0, 0, 0, 1 );

        clearArrays();
    }

    function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {

        // flat shape with texture
        // note: default UVs generated by ShapeBufferGemoetry are simply the x- and y-coordinates of the vertices

        var geometry = new THREE.ShapeBufferGeometry( shape );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { side: THREE.DoubleSide, map: texture } ) );
        mesh.position.set( x, y, z - 155 );
        mesh.rotation.set( rx, ry, rz );
        mesh.scale.set( s, s, s );
        container.add( mesh );

        // flat shape

        var geometry = new THREE.ShapeBufferGeometry( shape );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide } ) );
        mesh.position.set( x, y, z - 105 );
        mesh.rotation.set( rx, ry, rz );
        mesh.scale.set( s, s, s );
        container.add( mesh );

        // extruded shape

        var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color } ) );
        mesh.position.set( x, y, z - 55 );
        mesh.rotation.set( rx, ry, rz );
        mesh.scale.set( s, s, s );
        container.add( mesh );

        // lines

        shape.autoClose = true;
        var points = shape.createPointsGeometry();
        var spacedPoints = shape.createSpacedPointsGeometry( 50 );

        // solid line

        var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 3 } ) );
        line.position.set( x, y, z - 5 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        container.add( line );

        // line from equidistance sampled points

        var line = new THREE.Line( spacedPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 3 } ) );
        line.position.set( x, y, z + 5 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        container.add( line );

        // vertices from real points

        var particles = new THREE.Points( points, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 55 );
       particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        container.add( particles );

        // equidistance sampled points

        var particles = new THREE.Points( spacedPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 105 );
        particles.rotation.set( rx, ry, rz );
       particles.scale.set( s, s, s );
       container.add( particles );

    }

    function createVertexForEachPoint2(object_geometry, values_axis1, values_axis2, values_axis3) {
        for (var i = 0; i < x_values.length; i++) {
            object_geometry.push(new THREE.Vector3(values_axis1[i], values_axis2[i],values_axis3[i]));
        }
    }

    function createVertexForEachPoint(object_geometry, values_axis1, values_axis2, values_axis3) {
        for (var i = 0; i < values_axis1.length; i++) {
            object_geometry.vertices.push(new THREE.Vector3(values_axis1[i],
                values_axis2[i], values_axis3[i]));
        }
    }

    function clearArrays() {
        x_values.length = 0;
        y_values.length = 0;
        z_values.length = 0;
    }
}
