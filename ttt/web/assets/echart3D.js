//$(document.body).css('backgroundColor','#0c1520')
var myChart = echarts.init($('.wrapper').get(0));
var canvas = document.createElement('canvas');
var mapChart = echarts.init(canvas, null, {
    width: 2048*5,
    height: 1024*5
});

$.ajaxSetup({
    async : false    
}); 

$.get(__dirname + '/assets/china.json', function (data) {
    var json = JSON.parse(data)
    echarts.registerMap('mychina2', json);
});

$.get(__dirname + '/assets/world.json', function (data) {
    var json = JSON.parse(data)
    echarts.registerMap('world', json);
});

mapChart.setOption({
    backgroundColor: '#999',
    geo: [{
        type: 'map',
        map: 'world',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boundingCoords: [[-180, 90], [180, -90]],
        silent: true,
        itemStyle: {
            normal: {
                areaColor: '#0a142b',
                borderColor: '#9ac0eb',
                borderWidth: 1
            }
        }
    },
    {
        type: 'map',
        map: 'mychina2',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boundingCoords: [[-180, 90], [180, -90]],
        silent: true,
        itemStyle: {
            normal: {
                areaColor: '#0a142b',
                borderColor: '#9ac0eb',
                borderWidth:10
            }
        }
    },
    {
        type: 'map',
        map: 'mychina2',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        boundingCoords: [[-180, 90], [180, -90]],
        silent: true,
        itemStyle: {
            normal: {
                areaColor: '#0a142b',
                borderColor: '#9ac0eb',
                borderWidth:1
            }
        }
    }]
});
var option = {
    globe: {
        environment: '#0f1722',
        baseTexture: mapChart,

        displacementScale: 0.1,

        shading: 'realistic',
        realisticMaterial: {
            roughness: 0.1,
            metalness: 0
        },

        postEffect: {
            enable: true
        },
        temporalSuperSampling: {
            enable: true
        },
        light: {
            ambient: {
                color: '#0f1722',
                intensity: 2
            },
            main: {
                intensity: 0,
                shadow: false
            }
        },
        viewControl: {
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'cubicInOut',
            targetCoord: [106.08717,35.09616],
            distance: 70,
            autoRotate: false
        }
    },
    series: []
};

myChart.setOption(option)
