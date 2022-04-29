import { useEffect, useRef } from "react";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as $ from 'jquery'

const Canvas = () => {

    const mountRef = useRef(null);

    useEffect(() => {


                
        const raycaster = new THREE.Raycaster();
        const clock = new THREE.Clock();
        const scene = new THREE.Scene()
        const meshArr =[];
        const totalGroup = new THREE.Group(); 
        var dTime = 0, dPos = null,transTime = 50;;
        const pointer = new THREE.Vector2();
        let INTERSECTED;

        scene.add(totalGroup);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
        camera.position.set(0.2, 0, 0);



        //Lighting
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 0, 200, 0 );
        scene.add( hemiLight );


        const ambientLight = new THREE.AmbientLight(0xCCFFFF, 0.8); 
        scene.add(ambientLight);





        const renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        renderer.setClearColor(0xFFFFFF, 1);



        var orbitControl = new OrbitControls( camera, renderer.domElement );
        orbitControl.target.set(0, 0, 0);

        orbitControl.enableDamping = true;
        orbitControl.maxDistance = 4; //  this.controls.minDistance = 1;
        orbitControl.enablePan = false;
        orbitControl.maxPolarAngle = Math.PI / 2 + 0.4;






        const urls = [
        '/cubemap/px.png',
        '/cubemap/nx.png',
        '/cubemap/py.png',
        '/cubemap/ny.png',
        '/cubemap/pz.png',
        '/cubemap/nz.png',
        ];


        const refractionCube = new THREE.CubeTextureLoader().load( urls );
        refractionCube.mapping = THREE.CubeRefractionMapping;

        scene.background = refractionCube;
        //Model Loading
        const fbxLoader = new FBXLoader()
        fbxLoader.load(
            '/Holland_FBX_V010.fbx',
            (object) => {

            object.traverse(
                child => {
                console.log(child)

                // meshArr.push(child)

                }
            )
            
            object.scale.set(.02, .02, .02)
            object.position.y = -1.8
            totalGroup.add(object)
            // meshArr.push(object)

            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )




        var geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24, 1);
        var material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        var chair = new THREE.Mesh( geometry, material );
        chair.name = "chair_info"
        chair.position.set(-2.433,-1.520,-3.622);
        chair.scale.x =1
        chair.scale.y =1
        chair.scale.z =1
        meshArr.push(chair)


        var material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        var advanced_chair = new THREE.Mesh( geometry, material );
        advanced_chair.name = "advanced_chair_info"
        advanced_chair.position.set(2.731,-1.520,-4.040);
        advanced_chair.scale.x =1
        advanced_chair.scale.y =1
        advanced_chair.scale.z =1
        meshArr.push(advanced_chair)

        var material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        var random_spot1 = new THREE.Mesh( geometry, material );
        random_spot1.name = "random_spot_1_info"
        random_spot1.position.set(5.031,-1.520,1.240);
        random_spot1.scale.x =1
        random_spot1.scale.y =1
        random_spot1.scale.z =1
        meshArr.push(random_spot1)


        var material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        var random_spot2 = new THREE.Mesh( geometry, material );
        random_spot2.name = "random_spot_2_info"
        random_spot2.position.set(-4.893,-1.520,3.448);
        random_spot2.scale.x =1
        random_spot2.scale.y =1
        random_spot2.scale.z =1
        meshArr.push(random_spot2)





        var material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        var random_spot3 = new THREE.Mesh( geometry, material );
        random_spot3.name = "random_spot_3_info"
        random_spot3.position.set(0,-1.520,0);
        random_spot3.scale.x =1
        random_spot3.scale.y =1
        random_spot3.scale.z =1
        meshArr.push(random_spot3)


        totalGroup.add( chair );
        totalGroup.add( advanced_chair );
        totalGroup.add( random_spot1 );
        totalGroup.add( random_spot2 );
        totalGroup.add( random_spot3 );


        // document.addEventListener('click', onDocumentMouseClick, false);
        // window.addEventListener('resize', onWindowResize, false)
        // window.addEventListener( 'pointermove', onPointerMove );

        animate()


        function animate() {

        requestAnimationFrame(animate)
        render()

        }

        function render() {

        
        camera.lookAt( 0, 0, 0 );
        camera.updateProjectionMatrix()
        orbitControl.update();
        if (dTime > 0) {
            dTime--;
            totalGroup.position.x -= dPos.x;
            totalGroup.position.z -= dPos.z;
        }

        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( meshArr , false);

            if ( intersects.length > 0 ) {

                if ( INTERSECTED != intersects[0].object ) {


                    if ( INTERSECTED ){

                        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );


                        console.log("callled",INTERSECTED.currentHex );

                    } else{

                        INTERSECTED = intersects[ 0 ].object;
                        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();

                        console.log("callled1",INTERSECTED.currentHex );

                        INTERSECTED.material.emissive.setHex( 0xff0000 );


                    }

                    var canvasHalfWidth = renderer.domElement.offsetWidth / 2;
                    var canvasHalfHeight = renderer.domElement.offsetHeight / 2;

                    var posx = (pointer.x * canvasHalfWidth) + canvasHalfWidth + renderer.domElement.offsetLeft;
                    var posy = -(pointer.y * canvasHalfHeight) + canvasHalfHeight + renderer.domElement.offsetTop;
            

                    var tootipWidth = $("#tooltip")[0].offsetWidth;
                    var tootipHeight = $("#tooltip")[0].offsetHeight;


                    console.log(posx)

                    console.log(posy)
                    $("#tooltip").css({
                        display: "block",
                        opacity: 0.0
                    });
                    $("#tooltip").css({top : posx+'px',left : posy+'px'})
                    $("#tooltip").css({opacity : '1'})

                    $('html,body').css('cursor','pointer');


                }

            }else{


                if ( INTERSECTED ) {
                    
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

                }

                $("#tooltip").css({
                    display: "none"
                });
                $('html,body').css('cursor','default');

                INTERSECTED = null;

            }



            renderer.render(scene, camera)

        }


        return () => mountRef.current.removeChild( renderer.domElement);

    },[])

    

    return(

        <div ref={mountRef}>
            <div id="container"></div>
        </div>
    )
}

export default Canvas;