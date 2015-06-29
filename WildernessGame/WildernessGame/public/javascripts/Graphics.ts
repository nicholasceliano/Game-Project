/// <reference path="typings/three.d.ts" />

//var clock : THREE.Clock;

module Graphics {

    export var scene: THREE.Scene;
    var camera: THREE.PerspectiveCamera,
        cameraControls,
        renderer: THREE.WebGLRenderer;

    var renderScene = () => { renderer.render(scene, camera); };

    function animate() {
        requestAnimationFrame(animate);
        renderScene();
        cameraControls.update();
    }

    export function initScene() {
        var wHeight = 400, wWidth = 740;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, wWidth / wHeight, 1, 20000);
        camera.position.set(740, 740, 740);
        camera.lookAt(scene.position);

        //need to create an enviornment layout
        var gridXz = new THREE.GridHelper(200, 10);
        gridXz.setColors(new THREE.Color(0x006600), new THREE.Color(0x006600));
        gridXz.position.set(200, 0, 200);
        scene.add(gridXz);

        var gridXy = new THREE.GridHelper(200, 10);
        gridXy.position.set(200, 200, 0);
        gridXy.rotation.x = Math.PI / 2;
        gridXy.setColors(new THREE.Color(0x000066), new THREE.Color(0x000066));
        scene.add(gridXy);

        var gridYz = new THREE.GridHelper(200, 10);
        gridYz.position.set(0, 200, 200);
        gridYz.rotation.z = Math.PI / 2;
        gridYz.setColors(new THREE.Color(0x660000), new THREE.Color(0x660000));
        scene.add(gridYz);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(wWidth, wHeight);
        document.getElementById("gameScreen").appendChild(renderer.domElement);

        //Active Controls
        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
        window.addEventListener("keydown", Controls.onKeyDown, false);
        window.addEventListener("keyup", Controls.onKeyUp);

        //load page UI
        $("#txtChat").hide();

        animate();
    }

    export function createNewUser(name:string) {
        var userObj = Objects.user();
        userObj.name = name;
        userObj.position = new THREE.Vector3(50,50,50);

        scene.add(userObj);
        renderScene();
    }

    export function removeExistingUser(name: string) {
        var userObj = scene.getObjectByName(name);
        if (userObj != null || userObj !== undefined) {
            scene.remove(userObj);
            renderScene();
        }
    }

    export module Objects {

        ///////////
        //Objects//
        ///////////

        export function user() {
            var geo = new THREE.BoxGeometry(100, 100, 100);
            var mat = new THREE.MeshBasicMaterial();
            mat.color.setRGB(255, 0, 0);
            return new THREE.Mesh(geo, mat);
        }
    }

    export module Controls {
        var repeatState: any = {};
        var jumpIsActive = false;
        var chatSelected = false;

        function userJump(object: THREE.Object3D, distance: number, time: number) {
            var initialPosition: number = object.position.y;//this is a hack. wont work off flat surface
            var timePerDistance = (time / 2) / distance,
                totalTime = 0,
                directionUp = true,
                distanceTraveled = 0;

            jumpIsActive = true;

            var jump = setInterval(() => {
                totalTime = totalTime + timePerDistance;
                if (totalTime <= time) {
                    if (directionUp) {
                        object.translateY(2);
                        distanceTraveled++;
                        ClientSocket.userPositionChange(object);
                        if (distanceTraveled === distance)
                            directionUp = false;
                    } else {
                        object.translateY(-2);
                        distanceTraveled--;
                        ClientSocket.userPositionChange(object);
                    }
                }
                else {
                    object.position.y = initialPosition;
                    ClientSocket.userPositionChange(object);
                    jumpIsActive = false;
                    clearInterval(jump);
                }
            }, timePerDistance);
        }

        function repeatKeyBindings(e) {
            var userObj: THREE.Object3D = scene.getObjectByName(GeneralGameFunctions.getUserName());
            var objMoveAmnt = 5,
                rotationAngleSpeed= 25.21;
            this.keys = { LEFT: 37, A: 65, UP: 38, W: 87, RIGHT: 39, D: 68, DOWN: 40, S: 83, SPACEBAR: 32, Q: 81, E: 69 };

            function moveLeft() {
                userObj.translateZ(objMoveAmnt);
                ClientSocket.userPositionChange(userObj);
            }

            function moveRight() {
                userObj.translateZ(-objMoveAmnt);
                ClientSocket.userPositionChange(userObj);
            }

            function moveForward() {
                userObj.translateX(-objMoveAmnt);
                ClientSocket.userPositionChange(userObj);
            }

            function moveBackwards() {
                userObj.translateX(objMoveAmnt);
                ClientSocket.userPositionChange(userObj);
            }

            switch (e.keyCode) {
                case this.keys.UP:
                    moveForward();
                    break;
                case this.keys.W:
                    moveForward();
                    break;
                case this.keys.DOWN:
                    moveBackwards();
                    break;
                case this.keys.S:
                    moveBackwards();
                    break;
                case this.keys.RIGHT:
                    moveRight();
                    break;
                case this.keys.D:
                    userObj.rotateY(-rotationAngleSpeed);
                    ClientSocket.userPositionChange(userObj);
                    break;
                case this.keys.LEFT:
                    moveLeft();
                    break;
                case this.keys.A:
                    userObj.rotateY(rotationAngleSpeed);
                    ClientSocket.userPositionChange(userObj);
                    break;
                case this.keys.Q:
                    moveLeft();
                    break;
                case this.keys.E:
                    moveRight();
                    break;
                case this.keys.SPACEBAR:
                    if (!jumpIsActive)
                        userJump(userObj, 20, 500);
                    break;
                default:
                    break;
            }
        }

        export function onKeyDown(e) {
            var key = e.which;
            if (e.keyCode === 13 || chatSelected || e.keyCode === 27) {
                if ((e.keyCode === 13 && chatSelected) || (e.keyCode === 27 && chatSelected)) {
                    chatSelected = false;
                } else if (!chatSelected) {
                    $("#txtChat").show().focus();
                    chatSelected = true;
                }
            }
            else {
                if (!repeatState[key]) {
                    repeatState[key] = setInterval(() => {
                        repeatKeyBindings(e);
                    }, 15);
                }
            }
        }

        export function onKeyUp(e) {
            if (e.keyCode !== 13 && !chatSelected && e.keyCode !== 27) {
                var key = e.which;
                var timer = repeatState[key];
                if (timer) {
                    clearInterval(timer);
                    delete repeatState[key];
                }
            }
        }
    }
}