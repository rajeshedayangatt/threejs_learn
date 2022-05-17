import React  from "react";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import * as $ from 'jquery'
import { cubeimg } from "../urls";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import GUI from 'lil-gui'; 

import Modal from 'react-bootstrap/Modal';
import RandomImageComponent from "./RandomImageComponent";
import RandomTextComponent from "./RandomTextComponent";

const droneT = 200, droneS = 1;

class CanvasComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            show : false ,
            modalcontent : '' , 
            spinerstatus : true ,  
            buttonTexture : {} , 
            buttonStatus : "play",
            clock :  new THREE.Clock(),
            text1 : 'Text1',
            text2 : 'Text2',
            text3 : 'Text3',
            text4 : 'Text4',
            text5 : 'Text5',
        }

        //this.changeTexture = changeTexture
    }


    componentDidMount() {

        this.initCanvas();
        this.loadModel();
       // this.loadDrone();
        this.loadViewPoints();

       //this.totalGroup.scale.set(0.5,0.5,0.5)

        console.log(this.totalGroup)
        this.animate();

    }


    createText = () => {

        let materials = [
					new THREE.MeshPhongMaterial( { color: 'red', flatShading: true } ), // front
					new THREE.MeshPhongMaterial( { color: 'red' } ) // side
				];


        let textGeo = new TextGeometry( "Three js", {
            font: this.fontvar,
            size: 80,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5

        } );


        let textMesh1 = new THREE.Mesh( textGeo, new THREE.MeshPhongMaterial( { color: 'red', flatShading: true } ) );

        // textMesh1.position.x = 0.6;
        // textMesh1.position.y = 0.4;
        // textMesh1.position.z = 0;
        // textMesh1.rotation.x = 0;
        // textMesh1.rotation.y = Math.PI * 2;

        textMesh1.scale.set(0.2,0.2,0.2)
        console.log(this.totalGroup)

        this.totalGroup.add( textMesh1 );
    }

    loadText = () => {


        const loader = new FontLoader();

        const fonts = loader.load('font.json', ( response ) => {

                this.fontvar = response
                const fontobj = {
                    font: this.fontvar,
                    size: 80,
                    height: 25,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 2,
                    bevelSize: 1,
                    bevelOffset: 2,
                    bevelSegments: 5
        
                }



                this.planeArr.forEach((val,index) => {

                    console.log(val.name)

                    let textmeshgroup = new THREE.Group()
                    let textmeshgeometry = new TextGeometry( "text"+index, fontobj )
                    let textMesh = new THREE.Mesh(textmeshgeometry , new THREE.MeshStandardMaterial( { color: 'green'} ) );
                    textmeshgroup.rotation.y = -1.4 + index * 0.4;
                    textmeshgroup.scale.set(0.18,0.18,0.18)


                    if(val.name === "texureplane_01") {

                        textmeshgroup.position.set(val.position.x ,(val.position.y + 105),(val.position.z  - 20))

                    }

                    if(val.name === "texureplane_02") {

                        textmeshgroup.position.set(362.350 ,263.580,-262.490)

                    }

                    if(val.name === "texureplane_03") {

                        textmeshgroup.position.set(229.470,263.240,-378.000)

                    }

                    if(val.name === "texureplane_04") {

                        textmeshgroup.position.set(62.700,259.570,-426.490)

                    }

                    if(val.name === "texureplane_05") {

                        textmeshgroup.position.set(-106.810,260.730,-426.490)

                    }
                    textmeshgroup.type = "text_content"
                    textmeshgroup.name = "text"+(index + 1)
                    textmeshgroup.add(textMesh)
                    this.mainModel.add( textmeshgroup );
                    this.textGroup.push(textMesh)


                })

            


            },
    
        );
    }

    showModal = () => {
        this.setState({show : true})
    };

    hideModal = () => {
        this.setState({show : false ,  modalcontent : '' })
    };

    initCanvas = () => {

        this.totalGroup = new THREE.Group(); 
        this.droneGroup = new THREE.Group(); 
        this.textGroup = []
        this.planeArr = []
        this.scene = new THREE.Scene()
        this.meshArr =[];
        this.dTime = 0;
        this.dPos = null;
        this.transTime = 50;
        this.raycaster = new THREE.Raycaster();
        this.INTERSECTED = null;
        this.pointer = new THREE.Vector2();
        this.manager = new THREE.LoadingManager();
        this.drone = [];
        this.t = 0;
        this.clock = new THREE.Clock();
        this.scene.add(this.totalGroup);
        this.scene.add(this.droneGroup);

        this.droneStartingPositionX = droneT;
        this.droneStartingPositionZ = droneT;
        this.droneStartingPositionY = 150;

        this.droneStartingRotationY = 0;

        this.dronpos = "";
        this.fontvar = null;

        //camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 100);

		this.camera.position.set(0.1, 0, 0);
        //this.camera.position.set(0, 0, -0.2);
        this.droneWings = [];
        
        this.gui = new GUI()


        this.ambientLight = new THREE.AmbientLight(0xCCFFFF,  0.8);         
        this.scene.add(this.ambientLight);



        this.light = new THREE.DirectionalLight( 0xCCFFFF, 1.230);
        // this.light.intensity =0.2
        this.light.position.set( -6.180,6.880,5.130); //default; light shining from top
        this.light.castShadow = true; // default false
        this.light.shadow.mapSize.width = 1024; // default
        this.light.shadow.mapSize.height = 1024 ; // default
        this.light.shadow.camera.near = 1 // default
        this.light.shadow.camera.far = 1000; // default
        this.light.shadow.needsUpdate = true
        this.scene.add( this.light );

      //  this.gui.add(this.ambientLight,'intensity').min(0).max(100).step(0.001)
        //this.gui.add(this.light,'shadow')


        
        //Render
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        this.renderer.setClearColor(0xFFFFFF, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


        //controller
        this.orbitControl = new OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControl.enableDamping = true;
		this.orbitControl.maxDistance = 4; //  this.controls.minDistance = 1;
		this.orbitControl.enablePan = false;
		this.orbitControl.maxPolarAngle = Math.PI - 0.4;
		this.orbitControl.minPolarAngle = 0.2;
        //this.orbitControl.maxPolarAngle = Math.PI / 2 + 0.4;


        //world image load
        this.refractionCube = new THREE.CubeTextureLoader().load( cubeimg );
        this.refractionCube.mapping = THREE.CubeRefractionMapping;
        this.scene.background = this.refractionCube;


        this.manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

        };
        
        this.manager.onLoad = function ( ) {

        };
        

        //this.vedioElement.play()
        document.addEventListener('click', this.onDocumentMouseClick, false);
        window.addEventListener('resize', this.onWindowResize, false)
        window.addEventListener( 'pointermove', this.onPointerMove );


    }



    onPointerMove = (event) => {

        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( this.pointer, this.camera );

        let intersects = raycaster.intersectObjects( this.meshArr , false);

        
        if ( intersects.length > 0 ) {

            if ( this.INTERSECTED != intersects[0].object ) {


                if ( this.INTERSECTED ){

                    this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
                    this.INTERSECTED.visible = this.INTERSECTED.visible;

                } else{

                    this.INTERSECTED = intersects[ 0 ].object;
                    this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();

                    if(this.INTERSECTED.typeSpot === "modal_type")  {

                        this.INTERSECTED.material.emissive.setHex( 0x0000FF );

                    }else{

                        this.INTERSECTED.material.emissive.setHex( 0xff0000 );

                    }
                    this.INTERSECTED.visible = true;

                }

                let pos2D = this.Get2DPos(this.INTERSECTED, window.innerWidth, window.innerHeight, this.camera);
                
                if(this.INTERSECTED.typeSpot !== "modal_type" && this.INTERSECTED.typeSpot !== "button")  {

                    $("#tooltip").text(this.INTERSECTED.name)
                    $("#tooltip").css({
                        display: "block",
                        opacity: 0.0
                    });
                    $("#tooltip").fadeIn().css({top : (pos2D.y - 50)+'px',left : (pos2D.x - 70)+'px'})
                    $("#tooltip").fadeIn().animate({opacity : '1'},500)

                }
              

                $('html,body').css('cursor','pointer');

            }

        }else{


            if ( this.INTERSECTED ) {
                
                this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
                if(this.INTERSECTED.typeSpot === "modal_type")  {
                    this.INTERSECTED.visible = false;

                }

            }

            $("#tooltip").css({
                display: "none"
            });
            $('html,body').css('cursor','default');

            this.INTERSECTED = null;

        }

    }

    Get2DPos = (obj, cWidth, cHeight, camera) => {

        
        var vector = new THREE.Vector3();

        var widthHalf = 0.5 * cWidth;

        var heightHalf = 0.5 * cHeight;

        obj.updateMatrixWorld();

        vector.setFromMatrixPosition(obj.matrixWorld);

        vector.project(camera);

        vector.x = ( vector.x * widthHalf ) + widthHalf;

        vector.y = - ( vector.y * heightHalf ) + heightHalf;

        return {  x: vector.x, y: vector.y };


    }

    onWindowResize = (event) => {

        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderScene()

    }

    onDocumentMouseClick = (event) => {



        let mouse = new THREE.Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, this.camera );


        let intersects = raycaster.intersectObjects( this.meshArr )[0];
      
        if (intersects && intersects.object) {

            if(intersects.object.typeSpot === "modal_type")  {

                this.setState({modalcontent : intersects.object.name})
                this.showModal();

            }else if(intersects.object.typeSpot === "button"){

                if(this.state.buttonStatus === "play") {

                    this.setState({buttonStatus : "pause"});
                    this.vedioElement.play();
                    intersects.object.material.map = this.texturepause;
                }else{

                    this.vedioElement.pause();
                    this.setState({buttonStatus : "play"});
                    intersects.object.material.map = this.textureplay;

                }

            }else{



                console.log("camera",this.camera.position)

                  // intersects.object.material.color.setClearColor( "#0000ff" );
                  let posObj = intersects.object.position,
            
                  posTarget = {x:-posObj.x, z:-posObj.z},
                  posTotal = this.totalGroup.position;
                  console.log("posObj",posObj)
                  console.log("posTotal",posTotal)
                  this.dTime = this.transTime; 
                  this.dPos = {
                      x: ((posTotal.x + 0.1) - posTarget.x)/this.transTime,
                      z:((posTotal.z + 0.1) - posTarget.z)/ this.transTime
                  };

                  
            }
        }
      }

    loadTexturePlanes = () => {

        let geometry = new THREE.PlaneGeometry( 1, 1 );
        let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} );
        let plane = new THREE.Mesh( geometry, material );
        plane.position.set(429.000, 155.150, -84.230);
        plane.rotation.set(0,-1.373,0) 
        plane.scale.set(120.880, 256.800, 6.900);
        plane.visible = false
        plane.name = "texureplane_01"
        

        
        let geometry1 = new THREE.PlaneGeometry( 1, 1 );
        let material1 = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
        let plane1 = new THREE.Mesh( geometry1, material1 );
        plane1.position.set(362.350, 155.890, -240.580);
        plane1.rotation.set(-3.142,0.995,-3.142) 
        plane1.scale.set(125.960, 254.570, 6.900);
        plane1.name = "texureplane_02"
        plane1.visible = false

        let geometry2 = new THREE.PlaneGeometry( 1, 1 );
        let material2 = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
        let plane2 = new THREE.Mesh( geometry2, material2 );
        plane2.position.set(242.270, 140.430, -365.640);
        plane2.rotation.set(3.141,0.585,3.141) 
        plane2.scale.set(125.960, 288.760, 6.900);
        plane2.name = "texureplane_03"
        plane2.visible = false


        let geometry3 = new THREE.PlaneGeometry( 1, 1 );
        let material3 = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
        let plane3 = new THREE.Mesh( geometry3, material3 );
        plane3.position.set(85.070, 155.730, -426.490);
        plane3.rotation.set(3.141,0.145,3.141) 
        plane3.scale.set(125.960, 254.570, 6.900);
        plane3.name = "texureplane_04"
        plane3.visible = false


        
        let geometry4 = new THREE.PlaneGeometry( 1, 1 );
        let material4 = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} );
        let plane4 = new THREE.Mesh( geometry4, material4 );
        plane4.position.set(-83.200, 155.730, -426.490);
        plane4.rotation.set(3.141,-0.135,3.141) 
        plane4.scale.set(125.960, 254.570, 6.900);
        plane4.name = "texureplane_05"
        plane4.visible = false

        this.mainModel.add(plane)
        this.mainModel.add(plane1)
        this.mainModel.add(plane2)
        this.mainModel.add(plane3)
        this.mainModel.add(plane4)


        this.planeArr.push(plane)
        this.planeArr.push(plane1)
        this.planeArr.push(plane2)
        this.planeArr.push(plane3)
        this.planeArr.push(plane4)

        // this.meshArr.push(plane)
        // this.totalGroup.add( plane );


       /// scene.add( plane );
    }

    loadViewPoints = () => {

        
        let geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24, 1);

        let chair = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {color:  "#0000ff"} ) );
        chair.name = "chair_info"
        chair.position.set(-2.433,-1.520,-3.622);
        chair.scale.x =1
        chair.scale.y =1
        chair.scale.z =1
        this.meshArr.push(chair)


        let advanced_chair = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {color:  "#0000ff"} ) );
        advanced_chair.name = "advanced_chair_info"
        advanced_chair.position.set(2.731,-1.520,-4.040);
        advanced_chair.scale.x =1
        advanced_chair.scale.y =1
        advanced_chair.scale.z =1
        this.meshArr.push(advanced_chair)

        let random_spot1_material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        let random_spot1 = new THREE.Mesh( geometry, random_spot1_material );
        random_spot1.name = "random_spot_1_info"
        random_spot1.position.set(5.031,-1.520,1.240);
        random_spot1.scale.x =1
        random_spot1.scale.y =1
        random_spot1.scale.z =1
        this.meshArr.push(random_spot1)


        let random_spot2_material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        let random_spot2 = new THREE.Mesh( geometry, random_spot2_material );
        random_spot2.name = "random_spot_2_info"
        random_spot2.position.set(-4.893,-1.520,3.448);
        random_spot2.scale.x =1
        random_spot2.scale.y =1
        random_spot2.scale.z =1
        this.meshArr.push(random_spot2)


        let random_spot3_material = new THREE.MeshPhongMaterial( {color:  "#0000ff"} );
        let random_spot3 = new THREE.Mesh( geometry, random_spot3_material );
        random_spot3.name = "random_spot_3_info"
        random_spot3.position.set(0,-1.520,0);
        random_spot3.scale.x =1
        random_spot3.scale.y =1
        random_spot3.scale.z =1
        this.meshArr.push(random_spot3)


        let picturespot = new THREE.BoxGeometry(0.87, 0.57, 0.01);
        let picturespotmaterial = new THREE.MeshStandardMaterial({transparent:true, opacity:0.3, color:0x0000FF});
        let picturespotmesh = new THREE.Mesh(picturespot, picturespotmaterial);
        picturespotmesh.position.set(-3.131, -0.623, 0.042);
        picturespotmesh.rotation.y = 0.5 * Math.PI;
        picturespotmesh.visible = false;
        picturespotmesh.name = "modal_spot1"
        picturespotmesh.typeSpot = "modal_type"
        this.meshArr.push(picturespotmesh)


        this.vedioElement = document.getElementById("vedio_content")
        const vedioMap = new THREE.VideoTexture( this.vedioElement );
        let picturespot1 = new THREE.BoxGeometry(0.87, 0.55, 0.01);
        let picturespotmaterial1 =  new THREE.MeshBasicMaterial( {map: vedioMap, side: THREE.FrontSide, toneMapped: false} );
        let picturespotmesh1 = new THREE.Mesh(picturespot1, picturespotmaterial1);
        picturespotmesh1.position.set(3.140, -0.623,0.082);
        picturespotmesh1.rotation.y = 0.5 * Math.PI;
        picturespotmesh1.name = "modal_spot2"
        picturespotmesh1.typeSpot = "modal_type"


        this.textureplay = new THREE.TextureLoader().load( '/play.png' );
        this.texturepause = new THREE.TextureLoader().load( '/pause.png' );


        this.setState({ buttonTexture : this.textureplay});

        let buttongeomtery = new THREE.CircleGeometry( 0.5, 32 );
        let buttonmesh = new THREE.Mesh( buttongeomtery, new THREE.MeshPhongMaterial( {map:  new THREE.TextureLoader().load( '/play.png' ) , side: THREE.FrontSide} ) );
        buttonmesh.name = "button"
        buttonmesh.position.set(3.140, -1.053, 0.032);
        buttonmesh.rotation.y = -1.700
        buttonmesh.scale.x =0.220
        buttonmesh.scale.y =0.220
        buttonmesh.scale.z =0.220
        buttonmesh.typeSpot = "button"
        buttonmesh.material.needsUpdate = true;

        this.meshArr.push(buttonmesh)

        this.totalGroup.add( chair );
        this.totalGroup.add( advanced_chair );
        this.totalGroup.add( random_spot1 );
        this.totalGroup.add( random_spot2 );
        this.totalGroup.add( random_spot3 );

        this.totalGroup.add( picturespotmesh);
        this.totalGroup.add( picturespotmesh1 );
        this.totalGroup.add( buttonmesh );


    }




    loadDrone = () => {

        //Model Loading
        this.fbxLoader = new FBXLoader(this.manager )
        this.fbxLoader.load(
            '/drone_test.fbx',
            (object) => {

                object.traverse(child => {
                    child.castShadow = true;
                    child.receiveShadow = false;
                })


               object.scale.set(5, 5, 5)
               object.position.set(this.droneStartingPositionX, this.droneStartingPositionY, this.droneStartingPositionZ);
               console.log(object);
                
                this.droneObj = object



                let picturespot = new THREE.BoxGeometry(1,1,4)
                let picturespotmaterial = new THREE.MeshStandardMaterial({color:"red"});
                let picturespotmesh = new THREE.Mesh(picturespot, picturespotmaterial);
                picturespotmesh.position.set(-4.501, 2.007, 2.682);
                picturespotmesh.scale.set(0.600, 0.440, 1.060);
                picturespotmesh.typeSpot = "wing"
                this.droneObj.add(picturespotmesh)

                
                let picturespot1 = new THREE.BoxGeometry(1,1,4)
                let picturespotmaterial1 = new THREE.MeshStandardMaterial({color:"red"});
                let picturespotmesh1 = new THREE.Mesh(picturespot1, picturespotmaterial1);
                picturespotmesh1.position.set(4.449,1.447, -2.528);
                picturespotmesh1.scale.set(0.600, 0.440, 1.060);
                picturespotmesh1.typeSpot = "wing"
                this.droneObj.add(picturespotmesh1)


                
                let picturespot2 = new THREE.BoxGeometry(1,1,4)
                let picturespotmaterial2 = new THREE.MeshStandardMaterial({color:"red"});
                let picturespotmesh2 = new THREE.Mesh(picturespot2, picturespotmaterial2);
                picturespotmesh2.position.set(-4.531,1.447, -2.278);
                picturespotmesh2.scale.set(0.600, 0.440, 1.060);
                picturespotmesh2.typeSpot = "wing"
                this.droneObj.add(picturespotmesh2)


                
                let picturespot3 = new THREE.BoxGeometry(1,1,4)
                let picturespotmaterial3 = new THREE.MeshStandardMaterial({color:"red"});
                let picturespotmesh3 = new THREE.Mesh(picturespot3, picturespotmaterial3);
                picturespotmesh3.position.set(4.269, 2.007, 2.682);
                picturespotmesh3.scale.set(0.600, 0.440, 1.060);
                picturespotmesh3.typeSpot = "wing"
                this.droneObj.add(picturespotmesh3)



                this.mainModel.add(this.droneObj) // object
            },
            (xhr) => {
                // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
               // console.log(error)
            }
        )
    }

    loadModel = () => {

          //Model Loading
          this.fbxLoader = new FBXLoader(this.manager )
          this.fbxLoader.load(
              '/Holland_FBX_V010.fbx',
              (object) => {
  
                object.scale.set(.02, .02, .02)
                object.position.y = -1.8
                //object.receiveShadow = true;

                object.traverse(child => {

                    if(child.name == "Floor_White"  ) {
                        console.log("smodel",child.material.reflectivity)

                        child.material.shininess = 0.2
                        child.material.reflectivity = 0.5
                        child.material.metalness = 0.2
                        child.material.roughness = 1.2

                        child.material.needsUpdate = true
                        console.log("smodel",child.material.reflectivity)

                    }


                    //child.material.shininess = 20
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // if(child.name === "Blue" && child.name === "Yellow" && child.name === "chair" ) {

                        
                    //     child.castShadow = true;
                    //     child.receiveShadow = false;
                    // }
              
                })

                this.mainModel = object;
                
                this.totalGroup.add(this.mainModel)

                this.loadDrone();
                this.loadTexturePlanes();
                this.loadText();
                
                // meshArr.push(object)
    
              },
              (xhr) => {
                //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
              },
              (error) => {
                //  console.log(error)
              }
          )

    }

    animate = () => {

        requestAnimationFrame(this.animate)
        this.renderScene()
    }

    renderScene = () => {


        //this.camera.lookAt( this.camera.position.x, 0, this.camera.position.z );
        this.camera.updateProjectionMatrix()
        this.orbitControl.update();

        if (this.dTime > 0) {
            this.dTime--;
            this.totalGroup.position.x -= this.dPos.x 
            this.totalGroup.position.z -= this.dPos.z 
            
            console.log(this.totalGroup.position)
        }



        if(this.dronpos == "") {


          //  this.droneStartingPositionY = this.droneStartingPositionY - 0.05
            this.droneStartingPositionX = this.droneStartingPositionX - droneS
            this.droneStartingPositionZ = this.droneStartingPositionZ + 0.02


            if(this.droneStartingPositionX <= -droneT) {

                this.dronpos = "pos1"
                this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1
            }
        }
        
        if(this.dronpos == "pos1") {
   
         //   this.droneStartingPositionY = this.droneStartingPositionY - 0.05
            this.droneStartingPositionZ = this.droneStartingPositionZ - droneS
         
            if(this.droneStartingPositionZ <= -droneT) {

                this.dronpos = "pos2"
                this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1

            }
        }

        if(this.dronpos == "pos2") {

            this.droneStartingPositionX = this.droneStartingPositionX + droneS
           // this.droneStartingPositionY = this.droneStartingPositionY + 0.05

            if(this.droneStartingPositionX >= droneT)
            {
                this.dronpos = "pos3"

                this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1

            }

        }


        if(this.dronpos == "pos3") {


            this.droneStartingPositionZ = this.droneStartingPositionZ + droneS

            if(this.droneStartingPositionZ >= droneT) {

                this.dronpos = ""

                this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1

            }

        }

        if (this.droneObj) {
            this.droneObj.traverse(child => {
                if(child.typeSpot === "wing") {
                    child.rotation.y += 0.6
                }
            })
            this.droneObj.position.set(this.droneStartingPositionX, this.droneStartingPositionY, this.droneStartingPositionZ);
            this.droneObj.rotation.y += 0.003;

           // console.log("pos",this.droneObj.position)
        }


          
        this.renderer.render(this.scene, this.camera)


    }


    changeTextUpdate = (val,type) => {

        const fontobj = {
            font: this.fontvar,
            size: 80,
            height: 25,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1,
            bevelOffset: 2,
            bevelSegments: 5

        }

        this.mainModel.traverse(child => {


            if(child.type === "text_content") {

                console.log("child.name",child)

                if( child.name ===type) {

                    

                    let updatedgeometry =  new TextGeometry( val, fontobj );
                    updatedgeometry.computeBoundingBox();
                    const centerOffset = - 0.2 * ( updatedgeometry.boundingBox.max.x - updatedgeometry.boundingBox.min.x );
                    updatedgeometry.computeBoundingBox();
                    child.children[0].geometry = updatedgeometry
                    child.children[0].position.x = centerOffset;
    
                }
    
             


            }
           
        })
    }

    changeTexture = (link) =>{




        this.mainModel.traverse(child => {
    
            if(child.name === "texureplane_01") {

                const random_texure = new THREE.TextureLoader().load( link );
                random_texure.wrapS = THREE.RepeatWrapping;
                random_texure.wrapT = THREE.RepeatWrapping;
                random_texure.repeat.set( 2, 1 );
    
                child.material.map = random_texure
                child.material.needsUpdate=true;
                child.geometry.uvsNeedUpdate = true;
                child.material.repeat = 4;
                child.visible = true

                child.needsUpdate=true;

                console.log(child)
    
            }

            if(child.name === "texureplane_02") {
     
                const random_texure2 = new THREE.TextureLoader().load( link );
                random_texure2.wrapS = THREE.RepeatWrapping;
                random_texure2.wrapT = THREE.RepeatWrapping;
                random_texure2.repeat.set( 1, 2 );


                child.material.map = random_texure2
                child.material.needsUpdate=true;
                child.geometry.uvsNeedUpdate = true;
                child.needsUpdate=true;
                child.visible = true

                console.log(child)
    
            }

            if(child.name === "texureplane_03") {
                const random_texure3 = new THREE.TextureLoader().load( link );
                random_texure3.wrapS = THREE.RepeatWrapping;
                random_texure3.wrapT = THREE.RepeatWrapping;
                random_texure3.offset.set( 0, 0.5 );

                child.material.map = random_texure3
                child.material.needsUpdate=true;
                child.geometry.uvsNeedUpdate = true;
                child.needsUpdate=true;
                child.visible = true

                console.log(child)
    
            }


            if(child.name === "texureplane_04") {
                const random_texure4 = new THREE.TextureLoader().load( link );

                child.material.map = random_texure4
                child.material.needsUpdate=true;
                child.geometry.uvsNeedUpdate = true;
                child.needsUpdate=true;
                child.visible = true

                console.log(child)
    
            }

            if(child.name === "texureplane_05") {
                const random_texure5 = new THREE.TextureLoader().load( link );
                random_texure5.wrapS = THREE.RepeatWrapping;
                random_texure5.wrapT = THREE.RepeatWrapping;
                random_texure5.offset.set( 0.5, 0 );
                
                child.material.map = random_texure5

                child.visible = true

                child.material.needsUpdate=true;
                child.geometry.uvsNeedUpdate = true;
                child.needsUpdate=true;
                console.log(child)
    
            }
        })
    
    
    }
    render() {
        return(
            <div>
                {/* {

                    this.state.spinerstatus && <Spinner animation="grow"  />
               

                } */}
                <video className="hide" controls id="vedio_content" >
                    <source src="/small_test_0.mp4" type="video/mp4"/>
                </video>
               {/* <vedio width="320" height="240" src="/small_test_0.mp4"></vedio> */}
               {/* <RandomImageComponent changeTextureEvent={this.changeTexture} /> */}
               <RandomTextComponent changeTextureEvent={this.changeTextUpdate}  />
               <Modal show={this.state.show} onHide={this.hideModal}>
                    <Modal.Header closeButton>
                    <Modal.Title>Modal Spot</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modalcontent}</Modal.Body>
                   
                </Modal>
                <div id="tooltip"></div>
            </div>
        )
    }
}


export default CanvasComponent;