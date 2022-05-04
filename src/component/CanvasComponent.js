import React  from "react";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import * as $ from 'jquery'
import { cubeimg } from "../urls";

import 'bootstrap/dist/css/bootstrap.css';
import Modal from 'react-bootstrap/Modal';




class CanvasComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
            show : false ,
            modalcontent : '' , 
            spinerstatus : true ,  
            buttonTexture : {} , 
            buttonStatus : "play",
            clock :  new THREE.Clock()
        }
    }


    componentDidMount() {

        this.initCanvas();
        this.loadModel();
       // this.loadDrone();

        this.loadViewPoints();
        this.animate();
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

        this.droneStartingPositionX = 50.031;
        this.droneStartingPositionz = 10.240;
        this.droneStartingPositionY = 104

        this.droneStartingRotationY = 0;

        this.dronpos = "";


        //camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
        
        this.camera.position.set(0.2, 0, 0);
        this.droneWings = [];
        
        //Lighting
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        this.hemiLight.position.set( 0, 200, 0 );
        this.scene.add( this.hemiLight );

        this.ambientLight = new THREE.AmbientLight(0xCCFFFF, 0.8); 
        this.scene.add(this.ambientLight);

        //Render
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        this.renderer.setClearColor(0xFFFFFF, 1);

        //controller
        this.orbitControl = new OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControl.target.set(0, 0, 0);
        this.orbitControl.enableDamping = true;
        this.orbitControl.maxDistance = 4; //  this.controls.minDistance = 1;
        this.orbitControl.enablePan = false;
        this.orbitControl.maxPolarAngle = Math.PI / 2 + 0.4;


        //world image load
        this.refractionCube = new THREE.CubeTextureLoader().load( cubeimg );
        this.refractionCube.mapping = THREE.CubeRefractionMapping;
        this.scene.background = this.refractionCube;


        this.manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

           // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        
        };
        
        this.manager.onLoad = function ( ) {

            //console.log( 'Loading complete!');
        
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

                //console.log(this.INTERSECTED)


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


                  // intersects.object.material.color.setClearColor( "#0000ff" );
                  //console.log(raycaster.intersectObjects( this.meshArr ));
                  let posObj = intersects.object.position,
                  posTarget = {x:-posObj.x, z:-posObj.z},
                  posTotal = this.totalGroup.position;
                  this.dTime = this.transTime; 
                  this.dPos = {
                      x: (posTotal.x - posTarget.x)/this.transTime,
                      z:(posTotal.z - posTarget.z)/ this.transTime
                  };




            }

      
        }
      

    
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

        //console.log("calledl",this.state.buttonTexture)
            
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

                object.traverse(
                    child => {
                   // console.log(child)

                    }
                )
                
            //   object.scale.set(.4, .4, .4)
               object.position.y = this.droneStartingPositionY
                
               // this.droneGroup.add(object)
              //  this.droneGroup.position.y = this.droneStartingPositionY
                //this.drone.push(object)
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



                this.mainModel.add(object)
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
  
                object.traverse(
                    child => {
                   // console.log(child)
    
                    // meshArr.push(child)
    
                    }
                )

                const vPos = new THREE.Box3().setFromObject(object);

               // console.log("vPos",vPos)

                
                object.scale.set(.02, .02, .02)
                object.position.y = -1.8
                this.mainModel = object;
                
                this.totalGroup.add(object)

                this.loadDrone();
                // meshArr.push(object)
    
              },
              (xhr) => {
                 // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
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


        this.camera.lookAt( 0, 0, 0 );
        this.camera.updateProjectionMatrix()
        this.orbitControl.update();

        if (this.dTime > 0) {
            this.dTime--;
            this.totalGroup.position.x -= this.dPos.x;
            this.totalGroup.position.z -= this.dPos.z;
        }


        const elapsedTime = this.clock.getElapsedTime();
        const droneMovementAngle = elapsedTime * 0.3;

        if(this.droneObj) {
            if(this.dronpos === "") {


                this.droneStartingPositionY = this.droneStartingPositionY - 0.05
    
    
                this.droneStartingPositionX = this.droneStartingPositionX - 0.2
                this.droneStartingPositionz = this.droneStartingPositionz + 0.02
    
    
                if(this.droneStartingPositionX > -40 && this.droneStartingPositionX < -30) {
    
                    this.dronpos = "pos1"
                    this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1
                }
            }
            
            if(this.dronpos === "pos1") {
       
    
             
                if(this.droneStartingPositionz > -30 && this.droneStartingPositionz < -20) {
    
                    this.dronpos = "pos2"
                    this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1
    
                }
             this.droneStartingPositionY = this.droneStartingPositionY - 0.05
                this.droneStartingPositionz = this.droneStartingPositionz - 0.2
            }
            // if(this.droneGroup.position.x > -2) {
    
            if(this.dronpos === "pos2") {
    
    
                if(this.droneStartingPositionX > 20)
                {
                    this.dronpos = "pos3"
    
                    this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1
    
                }
                this.droneStartingPositionX = this.droneStartingPositionX + 0.2
                this.droneStartingPositionY = this.droneStartingPositionY + 0.05
    
            }
    
    
            if(this.dronpos === "pos3") {
    
    
    
    
                if(this.droneStartingPositionz > 10 && this.droneStartingPositionz < 30) {
    
                    this.dronpos = ""
    
                    this.droneStartingRotationY = this.droneStartingRotationY +  Math.PI  * 1
    
                }
                this.droneStartingPositionz = this.droneStartingPositionz + 0.2
    
            }
    
    
                this.droneObj.traverse(child => {
         
                     if(child.typeSpot === "wing") {
                         child.rotation.y += 0.6
         
                     }
         
                 })
         
    
    
    
    
            this.droneObj.position.x = this.droneStartingPositionX 
            this.droneObj.position.z =  this.droneStartingPositionz 
          //  this.droneObj.position.y =   this.droneStartingPositionY 
           this.droneObj.rotation.y = Math.sin(droneMovementAngle) * 2
    


        }

        
       
       

        
        this.renderer.render(this.scene, this.camera)


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