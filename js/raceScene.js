﻿// <reference path="libs/jquery-1.9.1/jquery-1.9.1.j" />
// <reference path="libs/three.js.r58/three.js" />
// <reference path="libs/three.js.r58/controls/OrbitControls.js" />
// <reference path="libs/three.js.r59/loaders/ColladaLoader.js" />
// <reference path="libs/requestAnimationFrame/RequestAnimationFrame.js" />
// <reference path="js/babylon.max.js" />
// <reference path="js/cannon.max.js" />
// <reference path="js/babylon.d.ts" />

var canvas;
var engine;
var Game = {};
Game.scenes = [];
Game.activeScene = 0;
var isWPressed = false;
var isDPressed = false;
var isSPressed = false;
var isAPressed = false;
var isGPressed = false;
var isLPressed = false;
document.addEventListener("DOMContentLoaded", startGame, false);

Game.createFirstScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.CannonJSPlugin());
    var ground = createGround("images/Untitled2.png", "images/Earth.jpg", scene);
    var light1 = new BABYLON.HemisphericLight("l1", new BABYLON.Vector3(0, 5, 0), scene);
    var tank = createHero(new BABYLON.Color3.Yellow, scene);
    var finish = createFinishLine(scene,0);
    var PowerUps = [];
    var Goo = [];

    var startMusic = new BABYLON.Sound("racestart", "sounds/Mario Kart Race Start.mp3", scene, null, { loop: false, autoplay: true });
    var raceMusic = new BABYLON.Sound("racemusic", "sounds/Luigi Circuit & Mario Circuit.mp3", scene, null, { loop: false, autoplay: true });
    raceMusic.play();
    startMusic.play();
    setTimeout(function () {
        startMusic.stop();
    }, 5000);

    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
    particleSystem.color1 = new BABYLON.Color3(0.3, 0.56, 1);
    particleSystem.color2 = new BABYLON.Color3(0.9, 0.9, 1);

    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 0.9;
    particleSystem.minEmitBox = new BABYLON.Vector3(-2, -2, -2);
    particleSystem.maxEmitBox = new BABYLON.Vector3(2, 2, 2);
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 2000;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.emitter = tank;


    tank.laps = 0;
    tank.passedCheckpoint = false;
    PowerUps = createPowerups(scene,0);
    var skybox = createSkybox(scene);
    tank.position = new BABYLON.Vector3(656, 1, 471);
    var followCamera = createFollowCamera(tank, scene);
    var portal = new BABYLON.Mesh.CreateCylinder("portal", 10, 10, 10, 50, 50, scene);
    portal.position = new BABYLON.Vector3(610, 5, 245);
    portal.material = new BABYLON.StandardMaterial("portalMaterial", scene);
    portal.material.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    portal.material.diffuseTexture.uScale = 3;

    Game.scenes.push(scene);

    Game.scenes[0].touchGoo = function (tank, Goo) {
        var sz = Goo.length;
        for (var i = 0; i < sz; i++) {
            if (tank.intersectsMesh(Goo[i], false)) {
                var splaat = new BABYLON.Sound("can", "sounds/Cartoon Slip.mp3", scene, null, { loop: false, autoplay: true });
                splaat.play();
                tank.rotationSensitivity *= 5;
                Goo[i].dispose();
                Goo.splice(i);
                setTimeout(function () {
                    tank.rotationSensitivity /= 5;
                }, 4000);
                break;
            }
        }

    }

    Game.scenes[0].applyTankMovement = function (tank, PowerUps, Goo, particleSystem, finish) {
        if (tank.position.y > 1)
            tank.position.y = 1;

        if (
            tank.position.x > portal.position.x - 6 &&
            tank.position.x < portal.position.x + 6 &&
            tank.position.z > portal.position.z - 6 &&
            tank.position.z < portal.position.z + 6
        ) {
            startMusic.stop();
            raceMusic.stop();
            Game.activeScene = 1;
        }
        if (tank.position.x >= -876 && tank.position.x <= -575 && tank.position.z >= -126 && tank.position.z <= -122) {
            tank.passedCheckpoint = true;
        }

        if (tank.passedCheckpoint && tank.intersectsMesh(finish, true)) {
            tank.laps++;
            tank.passedCheckpoint = false;
        }

        if (tank.position.x > PowerUps[0].position.x - 5.5 &&
            tank.position.x < PowerUps[0].position.x + 5.5 &&
            tank.position.z > PowerUps[0].position.z - 5.5 &&
            tank.position.z < PowerUps[0].position.z + 5.5)
        {
            particleSystem.start();
            var temp0 = PowerUps[0].position;
            PowerUps[0].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[0].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[1].position.x - 5.5 &&
            tank.position.x < PowerUps[1].position.x + 5.5 &&
            tank.position.z > PowerUps[1].position.z - 5.5 &&
            tank.position.z < PowerUps[1].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[1].position;
            PowerUps[1].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[1].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[2].position.x - 5.5 &&
            tank.position.x < PowerUps[2].position.x + 5.5 &&
            tank.position.z > PowerUps[2].position.z - 5.5 &&
            tank.position.z < PowerUps[2].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[2].position;
            PowerUps[2].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[2].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[3].position.x - 5.5 &&
            tank.position.x < PowerUps[3].position.x + 5.5 &&
            tank.position.z > PowerUps[3].position.z - 5.5 &&
            tank.position.z < PowerUps[3].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[3].position;
            PowerUps[3].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[3].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[4].position.x - 5.5 &&
            tank.position.x < PowerUps[4].position.x + 5.5 &&
            tank.position.z > PowerUps[4].position.z - 5.5 &&
            tank.position.z < PowerUps[4].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[4].position;
            PowerUps[4].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[4].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[5].position.x - 5.5 &&
            tank.position.x < PowerUps[5].position.x + 5.5 &&
            tank.position.z > PowerUps[5].position.z - 5.5 &&
            tank.position.z < PowerUps[5].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[5].position;
            PowerUps[5].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[5].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[6].position.x - 5.5 &&
            tank.position.x < PowerUps[6].position.x + 5.5 &&
            tank.position.z > PowerUps[6].position.z - 5.5 &&
            tank.position.z < PowerUps[6].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[6].position;
            PowerUps[6].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[6].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[7].position.x - 5.5 &&
            tank.position.x < PowerUps[7].position.x + 5.5 &&
            tank.position.z > PowerUps[7].position.z - 5.5 &&
            tank.position.z < PowerUps[7].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[7].position;
            PowerUps[7].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[7].position = temp0;
            }, 2000);
        }

        if (isWPressed) {
            if (flag) {
                setTimeout(function () {
                    flag = false;
                }, 3000);
            }
            else
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, 0, tank.speed));
        }

        if (isSPressed) {
            if (flag) {
                setTimeout(function () {
                    flag = false;
                }, 3000);
            }
            else
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, 0, -tank.speed));
        }

        if (isDPressed) {
            tank.rotation.y += 0.1 * tank.rotationSensitivity;
            tank.frontVector.x = Math.sin(tank.rotation.y) * -1;
            tank.frontVector.z = Math.cos(tank.rotation.y) * -1;
        }

        if (isAPressed) {
            tank.rotation.y -= 0.1 * tank.rotationSensitivity;
            tank.frontVector.x = Math.sin(tank.rotation.y) * -1;
            tank.frontVector.z = Math.cos(tank.rotation.y) * -1;
        }

        if (isGPressed) {
            console.log(tank.position);
            console.log(tank.laps);
            console.log(tank.passedCheckpoint);
            console.log(tank.power);
            console.log(Goo.length);
            if (tank.power === "CannonBall") {
                var cannonball = BABYLON.Mesh.CreateSphere("cannonball", 3, 1, scene, false);
                var cannonMat = new BABYLON.StandardMaterial("cannonMat", scene);
                cannonMat.diffuseColor = new BABYLON.Color3.Black;
                cannonball.material = cannonMat;

                var cannonsound = new BABYLON.Sound("can", "sounds/Cannon.wav", scene, null, { loop: false, autoplay: true });
                cannonsound.play();
                setTimeout(function () {
                    cannonsound.stop();
                }, 1000);

                cannonball.position = tank.position.add(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(5, 0, 5)));
                cannonball.position.y += 1;

                cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(cannonball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5, friction: 10, restitution: .2 }, scene);
                cannonball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(250, 0, 250)));

                setTimeout(function () {
                    cannonball.dispose();
                }, 2000);
                tank.power = "none";
            }
            else if (tank.power === "SpeedBuff") {
                var speedsound = new BABYLON.Sound("can", "sounds/Item Box Sound3.mp3", scene, null, { loop: false, autoplay: true });
                speedsound.play();
                tank.speed *= 1.5;
                tank.power = "none";
                var color = tank.material.diffuseColor;
                var ani = scene.beginAnimation(tank, 0, 180, true);
                setTimeout(function () {
                    tank.speed /= 1.5;
                    speedsound.stop();
                    ani.stop();
                    tank.material.diffuseColor = color;
                }, 3000);
            }
            else if (tank.power === "SpeedNerf") {
                tank.speed /= 1.5;
                tank.power = "none";
                var slowsound = new BABYLON.Sound("can", "sounds/Sitcom Laughter Applause2.mp3", scene, null, { loop: false, autoplay: true });
                slowsound.play();
                setTimeout(function () {
                    tank.speed *= 1.5;
                    slowsound.stop();
                }, 3000);
            }
            else if (tank.power === "GooStain") {
                var splaat = new BABYLON.Sound("can", "sounds/Splat.mp3", scene, null, { loop: false, autoplay: true });
                splaat.play();
                var goo = new BABYLON.Mesh.CreateBox("boxsss", 20, scene);
                goo.position = tank.position.add(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(-50, 0, -50)));
                goo.position.y = -9;
                goo.material = new BABYLON.StandardMaterial("target", scene);
                goo.material.diffuseTexture = new BABYLON.Texture("images/goo.png", scene);
                goo.material.diffuseTexture.hasAlpha = true;
                Goo.push(goo);
                tank.power = "none";
            }
        }

        if (isLPressed) {
            //console.log(freeCamera.position);
        }
    }
    Game.scenes[0].renderLoop = function () {
        this.applyTankMovement(tank, PowerUps, Goo, particleSystem, finish);
        this.touchGoo(tank, Goo);
        this.render();
    }
    return scene;
}

Game.createSecondScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.CannonJSPlugin());
    var ground = createGround("images/Track1.png", "images/earth2.jpg", scene);
    var light1 = new BABYLON.HemisphericLight("l1", new BABYLON.Vector3(0, 5, 0), scene);
    var tank = createHero(new BABYLON.Color3.Green, scene);
    var finish = createFinishLine(scene,1);
    var PowerUps = [];
    var Goo = [];
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
    particleSystem.color1 = new BABYLON.Color3(0.3, 0.56, 1);
    particleSystem.color2 = new BABYLON.Color3(0.9, 0.9, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
    scene.fogDensity = 0.005;
    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 0.9;
    particleSystem.minEmitBox = new BABYLON.Vector3(-2, -2, -2);
    particleSystem.maxEmitBox = new BABYLON.Vector3(2, 2, 2);
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 2000;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.emitter = tank;

    tank.laps = 0;
    tank.passedCheckpoint = false;
    PowerUps = createPowerups(scene,1);
    var skybox = createSkybox(scene);
    tank.position = new BABYLON.Vector3(831, 1, 41);
    //var freeCamera = createFreeCamera(scene);
    followCamera = createFollowCamera(tank, scene);
    var portal = new BABYLON.Mesh.CreateCylinder("portal", 10, 10, 10, 50, 50, scene);
    portal.position = new BABYLON.Vector3(610, 5, 245);
    portal.material = new BABYLON.StandardMaterial("portalMaterial", scene);
    portal.material.diffuseTexture = new BABYLON.Texture("images/lightning.jpg", scene);
    portal.material.diffuseTexture.uScale = 3;

    Game.scenes.push(scene);

    Game.scenes[1].touchGoo = function (tank, Goo) {
        var sz = Goo.length;
        for (var i = 0; i < sz; i++) {
            if (tank.intersectsMesh(Goo[i], false)) {
                var splaat = new BABYLON.Sound("can", "sounds/Cartoon Slip.mp3", scene, null, { loop: false, autoplay: true });
                splaat.play();
                tank.rotationSensitivity *= 5;
                Goo[i].dispose();
                Goo.splice(i);
                setTimeout(function () {
                    tank.rotationSensitivity /= 5;
                }, 4000);
                break;
            }
        }

    }

    Game.scenes[1].applyTankMovement = function (tank, PowerUps, Goo, particleSystem) {
        if (tank.position.y > 1)
            tank.position.y = 1;

        if (
            tank.position.x > portal.position.x - 6 &&
            tank.position.x < portal.position.x + 6 &&
            tank.position.z > portal.position.z - 6 &&
            tank.position.z < portal.position.z + 6
        )
            Game.activeScene = 1;

        if (tank.position.x >= -797 && tank.position.x <= -723 && tank.position.z >= 317 && tank.position.z <= 322) {
            tank.passedCheckpoint = true;
        }

        if (tank.passedCheckpoint && tank.intersectsMesh(finish, true)) {
            tank.laps++;
            tank.passedCheckpoint = false;
        }

        if (tank.position.x > PowerUps[0].position.x - 5.5 &&
            tank.position.x < PowerUps[0].position.x + 5.5 &&
            tank.position.z > PowerUps[0].position.z - 5.5 &&
            tank.position.z < PowerUps[0].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[0].position;
            PowerUps[0].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[0].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[1].position.x - 5.5 &&
            tank.position.x < PowerUps[1].position.x + 5.5 &&
            tank.position.z > PowerUps[1].position.z - 5.5 &&
            tank.position.z < PowerUps[1].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[1].position;
            PowerUps[1].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[1].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[2].position.x - 5.5 &&
            tank.position.x < PowerUps[2].position.x + 5.5 &&
            tank.position.z > PowerUps[2].position.z - 5.5 &&
            tank.position.z < PowerUps[2].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[2].position;
            PowerUps[2].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[2].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[3].position.x - 5.5 &&
            tank.position.x < PowerUps[3].position.x + 5.5 &&
            tank.position.z > PowerUps[3].position.z - 5.5 &&
            tank.position.z < PowerUps[3].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[3].position;
            PowerUps[3].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[3].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[4].position.x - 5.5 &&
            tank.position.x < PowerUps[4].position.x + 5.5 &&
            tank.position.z > PowerUps[4].position.z - 5.5 &&
            tank.position.z < PowerUps[4].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[4].position;
            PowerUps[4].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[4].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[5].position.x - 5.5 &&
            tank.position.x < PowerUps[5].position.x + 5.5 &&
            tank.position.z > PowerUps[5].position.z - 5.5 &&
            tank.position.z < PowerUps[5].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[5].position;
            PowerUps[5].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[5].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[6].position.x - 5.5 &&
            tank.position.x < PowerUps[6].position.x + 5.5 &&
            tank.position.z > PowerUps[6].position.z - 5.5 &&
            tank.position.z < PowerUps[6].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[6].position;
            PowerUps[6].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[6].position = temp0;
            }, 2000);
        }

        if (tank.position.x > PowerUps[7].position.x - 5.5 &&
            tank.position.x < PowerUps[7].position.x + 5.5 &&
            tank.position.z > PowerUps[7].position.z - 5.5 &&
            tank.position.z < PowerUps[7].position.z + 5.5) {
            particleSystem.start();
            var temp0 = PowerUps[7].position;
            PowerUps[7].position = BABYLON.Vector3.Zero();

            var glass = new BABYLON.Sound("broken", "sounds/Glass Vase-trimmed.mp3", scene, null, { loop: false, autoplay: true });
            glass.play();

            tank.power = RandomPower(tank);

            setTimeout(function () {
                particleSystem.stop();
            }, 75);

            setTimeout(function () {
                PowerUps[7].position = temp0;
            }, 2000);
        }
        if (isLPressed) {
            console.log(freeCamera.position);
        }
        if (isWPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, 0, tank.speed));
        }

        if (isGPressed) {
            console.log(tank.position);
            console.log(tank.laps);
            console.log(tank.passedCheckpoint);
            console.log(tank.power);
            console.log(Goo.length);
            if (tank.power === "CannonBall") {
                var cannonball = BABYLON.Mesh.CreateSphere("cannonball", 3, 1, scene, false);
                var cannonMat = new BABYLON.StandardMaterial("cannonMat", scene);
                // pink : tankMaterial.diffuseColor = new BABYLON.Vector3(0.90, 0.67, 0.93);
                // brown: tankMaterial.diffuseColor = new BABYLON.Vector3(0.27, 0.19, 0.19);
                cannonMat.diffuseColor = new BABYLON.Color3.Black;
                cannonball.material = cannonMat;
                var cannonsound = new BABYLON.Sound("can", "sounds/Cannon.wav", scene, null, { loop: false, autoplay: true });
                //cannonsound.play();
                setTimeout(function () {
                    cannonsound.stop();
                }, 1000);
                cannonball.position = tank.position.add(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(5, 0, 5)));
                cannonball.position.y += 1;
                cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(cannonball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5, friction: 10, restitution: .2 }, scene);
                cannonball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(250, 0, 250)));
                setTimeout(function () {
                    cannonball.dispose();
                }, 2000);
                tank.power = "none";
            }
            else if (tank.power === "SpeedBuff") {
                var speedsound = new BABYLON.Sound("can", "sounds/Item Box Sound3.mp3", scene, null, { loop: false, autoplay: true });
                speedsound.play();
                tank.speed *= 1.5;
                tank.power = "none";
                var color = tank.material.diffuseColor;
                var ani = scene.beginAnimation(tank, 0, 180, true);
                setTimeout(function () {
                    tank.speed /= 1.5;
                    speedsound.stop();
                    ani.stop();
                    tank.material.diffuseColor = color;
                }, 3000);
            }
            else if (tank.power === "SpeedNerf") {
                tank.speed /= 1.5;
                tank.power = "none";
                var slowsound = new BABYLON.Sound("can", "sounds/Sitcom Laughter Applause2.mp3", scene, null, { loop: false, autoplay: true });
                slowsound.play();
                setTimeout(function () {
                    tank.speed *= 1.5;
                    slowsound.stop();
                }, 3000);
            }
            else if (tank.power === "GooStain") {
                var splaat = new BABYLON.Sound("can", "sounds/Splat.mp3", scene, null, { loop: false, autoplay: true });
                splaat.play();
                var goo = new BABYLON.Mesh.CreateBox("boxsss", 20, scene);
                goo.position = tank.position.add(BABYLON.Vector3.Zero().add(tank.frontVector.normalize().multiplyByFloats(-50, 0, -50)));
                goo.position.y = -9;
                goo.material = new BABYLON.StandardMaterial("target", scene);
                goo.material.diffuseTexture = new BABYLON.Texture("images/goo.png", scene);
                goo.material.diffuseTexture.hasAlpha = true;
                Goo.push(goo);
                tank.power = "none";
            }
        }

        if (isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, 0, -tank.speed));
        }

        if (isDPressed) {
            tank.rotation.y += 0.1 * tank.rotationSensitivity;
            tank.frontVector.x = Math.sin(tank.rotation.y) * -1;
            tank.frontVector.z = Math.cos(tank.rotation.y) * -1;
        }

        if (isAPressed) {
            tank.rotation.y -= 0.1 * tank.rotationSensitivity;
            tank.frontVector.x = Math.sin(tank.rotation.y) * -1;
            tank.frontVector.z = Math.cos(tank.rotation.y) * -1;
        }
    }
    Game.scenes[1].renderLoop = function () {
        this.applyTankMovement(tank, PowerUps, Goo, particleSystem);
        this.touchGoo(tank, Goo);
        this.render();
    }
    return scene;
}

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    Game.createFirstScene();
    Game.createSecondScene();
    engine.runRenderLoop(function () {

        Game.scenes[Game.activeScene].renderLoop();
        
    });

}

document.addEventListener("keydown", function (event) {

    if (event.key === 'a' || event.key === 'A') {
        isAPressed = true;
    }
    if (event.key === 'd' || event.key === 'D') {
        isDPressed = true;
    }
    if (event.key === 'w' || event.key === 'W') {
        isWPressed = true;
    }
    if (event.key === 's' || event.key === 'S') {
        isSPressed = true;
    }
    if (event.key === 'g' || event.key === 'G') {
        isGPressed = true;
    }
    if (event.key === 'l' || event.key === 'L') {
        isLPressed = true;
    }
});

document.addEventListener("keyup", function (event) {

    if (event.key === 'a' || event.key === 'A') {
        isAPressed = false;
    }
    if (event.key === 'd' || event.key === 'D') {
        isDPressed = false;
    }
    if (event.key === 'w' || event.key === 'W') {
        isWPressed = false;
    }
    if (event.key === 's' || event.key === 'S') {
        isSPressed = false;
    }
    if (event.key === 'g' || event.key === 'G') {
        isGPressed = false;
    }
    if (event.key === 'l' || event.key === 'L') {
        isLPressed = false;
    }
});

function createGround(ur1, ur2, scene) {
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("G"+Game.activeScene, ur1, 2000, 2000,50,0,100,scene,false);
    var groundMaterial = new BABYLON.StandardMaterial("M"+Game.activeScene, scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(ur2, scene);
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    return ground;
}

function createFreeCamera(scene) {
    var camera = new BABYLON.FreeCamera("C1", new BABYLON.Vector3(0, 5, 0), scene);
    camera.attachControl(canvas);
    camera.keysUp.push('w'.charCodeAt(0));
    camera.keysUp.push('W'.charCodeAt(0));

    camera.keysLeft.push('a'.charCodeAt(0));
    camera.keysLeft.push('A'.charCodeAt(0));

    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));

    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    camera.checkCollisions = false;
    camera.speed = 10   ;
    return camera;
}

function createFollowCamera(tar, scene) {
    var camera = new BABYLON.FollowCamera("follow", new BABYLON.Vector3(0, 2, -20), scene);
    camera.lockedTarget = tar;
    camera.radius = 10;
    camera.heightOffset = 2;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 10;
    camera.checkCollisions = true;
    return camera;
}

function createHero(color, scene) {
    var tank = new BABYLON.Mesh.CreateBox("tank", 2, scene);
    var animationBox = new BABYLON.Animation("myAnimation", "material.diffuseColor", 180, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];

    keys.push({
        frame: 0,
        value: new BABYLON.Color3(1, 0, 0)
    });

    keys.push({
        frame: 60,
        value: new BABYLON.Color3(0, 1, 0)
    });

    keys.push({
        frame: 120,
        value: new BABYLON.Color3(0, 0, 1)
    });

    animationBox.setKeys(keys);
    var tankMaterial = new BABYLON.StandardMaterial("tankMat", scene);
    tankMaterial.diffuseColor = color;

    tank.material = tankMaterial;
    tank.animations.push(animationBox);
    tank.ellipsoid = new BABYLON.Vector3(3, 1.0, 3);
    tank.ellipsoidOffset = new BABYLON.Vector3(0, 1.0, 0);
    tank.scaling.y = 0.5;
    tank.scaling.x = 1.5;
    tank.scaling.z = 2;
    tank.rotationSensitivity = 1.3;

    tank.speed = 4;
    tank.frontVector = new BABYLON.Vector3(0, 0, -1);
    tank.power = "none";
    tank.rotation.x -= 0.05;


    var tiremat = new BABYLON.StandardMaterial("tirmat", scene);
    tiremat.diffuseColor = new BABYLON.Color3.Red;

    var tire1 = new BABYLON.Mesh.CreateCylinder("cylinder", 1, 10, 10, 12, 3, scene);
    tire1.material = tiremat;

    tire1.scaling.z *= 0.1;
    tire1.scaling.y *= 0.1;
    tire1.scaling.x *= 0.3;

    tire1.position.y += 0.1;
    tire1.position.x += 1;
    tire1.position.z += 0.9;
    tire1.rotation.z = Math.PI / 2;

    tire1.parent = tank;


    var tire2 = new BABYLON.Mesh.CreateCylinder("cylinder", 1, 10, 10, 12, 3, scene);
    tire2.material = tiremat;

    tire2.scaling.z *= 0.1;
    tire2.scaling.y *= 0.1;
    tire2.scaling.x *= 0.3;

    tire2.position.y += 0.1;
    tire2.position.x -= 1;
    tire2.position.z += 0.9;
    tire2.rotation.z = Math.PI / 2;

    tire2.parent = tank;

    var tire3 = new BABYLON.Mesh.CreateCylinder("cylinder", 1, 7, 7, 12, 3, scene);
    tire3.material = tiremat;

    tire3.scaling.z *= 0.1;
    tire3.scaling.y *= 0.1;
    tire3.scaling.x *= 0.3;

    tire3.position.y -= 0.2;
    tire3.position.x -= 1;
    tire3.position.z -= 0.9;
    tire3.rotation.z = Math.PI / 2;

    tire3.parent = tank;

    var tire4 = new BABYLON.Mesh.CreateCylinder("cylinder", 1, 7, 7, 12, 3, scene);
    tire4.material = tiremat;

    tire4.scaling.z *= 0.1;
    tire4.scaling.y *= 0.1;
    tire4.scaling.x *= 0.3;

    tire4.position.y -= 0.1;
    tire4.position.x += 1;
    tire4.position.z -= 0.9;
    tire4.rotation.z = Math.PI / 2;

    tire4.parent = tank;

    tank.checkCollisions = true;
    return tank;
}

function createFinishLine(scene, sceneIndex) {
    var finishLine = BABYLON.Mesh.CreateBox("line", 2, scene);
    var finishSign = BABYLON.Mesh.CreateCylinder("cylinder", 50, 3, 3, 12, 1, scene);
    var finishSign2 = BABYLON.Mesh.CreateCylinder("cylinder2", 50, 3, 3, 12, 1, scene);
    var finishFlag = BABYLON.Mesh.CreateBox("line", 2, scene);
    var realFinishLine = BABYLON.Mesh.CreateBox("sss", 2, scene);

    var lineMaterial = new BABYLON.StandardMaterial("M2", scene);
    lineMaterial.diffuseTexture = new BABYLON.Texture("images/stripes33.jpg", scene);
    lineMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
    
    var signMaterial = new BABYLON.StandardMaterial("M3", scene);
    signMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    var mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseColor = BABYLON.Color3.White();
    mat.alpha = 0;
    if (sceneIndex === 0) {
        
        finishLine.scaling.x = 180;
        finishLine.scaling.y = 0.1;
        finishLine.scaling.z = 5;
        finishLine.position.x = 578;
        finishLine.position.y = 0;
        finishLine.position.z = 382;
        finishLine.rotation.y = -0.5;
        finishLine.material = lineMaterial;

        
        finishSign.position.x = 424;
        finishSign.position.y = 25;
        finishSign.position.z = 298;
        finishSign.material = signMaterial;
        finishLine.sign1 = finishSign;

        
        finishSign2.position.x = 731;
        finishSign2.position.y = 25;
        finishSign2.position.z = 466;
        finishSign2.material = signMaterial;
        finishLine.sign2 = finishSign2;

        
        finishFlag.scaling.x = 180;
        finishFlag.scaling.y = 0.1;
        finishFlag.scaling.z = 5;
        finishFlag.position.x = 577.5;
        finishFlag.position.y = 50;
        finishFlag.position.z = 382;
        finishFlag.rotation.x = Math.PI / 2;
        finishFlag.rotation.y = -0.5;
        finishFlag.material = lineMaterial;
        finishLine.flag = finishFlag;

        
        realFinishLine.scaling.x = 180;
        realFinishLine.scaling.y = 1;
        realFinishLine.scaling.z = 5;
        realFinishLine.position.x = 578;
        realFinishLine.position.y = 1;
        realFinishLine.position.z = 382;
        realFinishLine.rotation.y = -0.5;
        realFinishLine.material = mat;
    }

    else if (sceneIndex === 1) {
        finishLine.scaling.x = 60;
        finishLine.scaling.y = 0.1;
        finishLine.scaling.z = 5;
        finishLine.position.x = 819.5;
        finishLine.position.y = 0;
        finishLine.position.z = 12.5;
        finishLine.material = lineMaterial;


        finishSign.position.x = 762;
        finishSign.position.y = 25;
        finishSign.position.z = 12;
        finishSign.material = signMaterial;
        finishLine.sign1 = finishSign;


        finishSign2.position.x = 877;
        finishSign2.position.y = 25;
        finishSign2.position.z = 13;
        finishSign2.material = signMaterial;
        finishLine.sign2 = finishSign2;


        finishFlag.scaling.x = 58;
        finishFlag.scaling.y = 0.1;
        finishFlag.scaling.z = 5;
        finishFlag.position.x = 819.5;
        finishFlag.position.y = 50;
        finishFlag.position.z = 12.5;
        finishFlag.rotation.x = Math.PI / 2;
        finishFlag.material = lineMaterial;
        finishLine.flag = finishFlag;


        realFinishLine.scaling.x = 60;
        realFinishLine.scaling.y = 1;
        realFinishLine.scaling.z = 5;
        realFinishLine.position.x = 819.5;
        realFinishLine.position.y = 1;
        realFinishLine.position.z = 12.5;
        realFinishLine.material = mat;
    }
    return realFinishLine;
}

function createPowerups(scene,sceneIndex) {
    var Ups = [];
    var UpsMaterial = [];

    UpsMaterial[0] = new BABYLON.StandardMaterial("U1", scene);
    UpsMaterial[0].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[0].alpha = 0.8;

    UpsMaterial[1] = new BABYLON.StandardMaterial("U2", scene);
    UpsMaterial[1].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[1].alpha = 0.8;

    UpsMaterial[2] = new BABYLON.StandardMaterial("U3", scene);
    UpsMaterial[2].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[2].alpha = 0.8;

    UpsMaterial[3] = new BABYLON.StandardMaterial("U4", scene);
    UpsMaterial[3].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[3].alpha = 0.8;

    UpsMaterial[4] = new BABYLON.StandardMaterial("U5", scene);
    UpsMaterial[4].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[4].alpha = 0.8;

    UpsMaterial[5] = new BABYLON.StandardMaterial("U6", scene);
    UpsMaterial[5].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[5].alpha = 0.8;

    UpsMaterial[6] = new BABYLON.StandardMaterial("U7", scene);
    UpsMaterial[6].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[6].alpha = 0.8;

    UpsMaterial[7] = new BABYLON.StandardMaterial("U8", scene);
    UpsMaterial[7].emissiveColor = new BABYLON.Color3(1, 1, 1);
    UpsMaterial[7].alpha = 0.8;

    Ups[0] = new BABYLON.Mesh.CreateBox("powerup_1", 8, scene);
    Ups[1] = new BABYLON.Mesh.CreateBox("powerup_2", 8, scene);
    Ups[2] = new BABYLON.Mesh.CreateBox("powerup_3", 8, scene);
    Ups[3] = new BABYLON.Mesh.CreateBox("powerup_4", 8, scene);
    Ups[4] = new BABYLON.Mesh.CreateBox("powerup_5", 8, scene);
    Ups[5] = new BABYLON.Mesh.CreateBox("powerup_6", 8, scene);
    Ups[6] = new BABYLON.Mesh.CreateBox("powerup_7", 8, scene);
    Ups[7] = new BABYLON.Mesh.CreateBox("powerup_8", 8, scene);
    if (sceneIndex === 0) {
        Ups[0].position.x = 563;
        Ups[0].position.y = 5;
        Ups[0].position.z = -445;

        Ups[1].position.x = 518;
        Ups[1].position.y = 5;
        Ups[1].position.z = -365;

        Ups[2].position.x = 473;
        Ups[2].position.y = 5;
        Ups[2].position.z = -307;

        Ups[3].position.x = 428;
        Ups[3].position.y = 5;
        Ups[3].position.z = -262;

        Ups[4].position.x = -609;
        Ups[4].position.y = 5;
        Ups[4].position.z = -22;

        Ups[5].position.x = -663;
        Ups[5].position.y = 5;
        Ups[5].position.z = -8;

        Ups[6].position.x = -718;
        Ups[6].position.y = 5;
        Ups[6].position.z = 5;

        Ups[7].position.x = -802;
        Ups[7].position.y = 5;
        Ups[7].position.z = 28;
    }
    else if (sceneIndex === 1) {
        Ups[0].position.x = 802;
        Ups[0].position.y = 5;
        Ups[0].position.z = -499;

        Ups[1].position.x = 769;
        Ups[1].position.y = 5;
        Ups[1].position.z = -495;

        Ups[2].position.x = 735;
        Ups[2].position.y = 5;
        Ups[2].position.z = -489;

        Ups[3].position.x = -690;
        Ups[3].position.y = 5;
        Ups[3].position.z = -95;

        Ups[4].position.x = -724;
        Ups[4].position.y = 5;
        Ups[4].position.z = -94;

        Ups[5].position.x = -762;
        Ups[5].position.y = 5;
        Ups[5].position.z = -93;

        Ups[6].position.x = -794;
        Ups[6].position.y = 5;
        Ups[6].position.z = -91;

        Ups[7].position.x = -24;
        Ups[7].position.y = 5;
        Ups[7].position.z = 531;
    }

        Ups[0].material = UpsMaterial[0];
        Ups[1].material = UpsMaterial[1];
        Ups[2].material = UpsMaterial[2];
        Ups[3].material = UpsMaterial[3];
        Ups[4].material = UpsMaterial[4];
        Ups[5].material = UpsMaterial[5];
        Ups[6].material = UpsMaterial[6];
        Ups[7].material = UpsMaterial[7];

        var animationBox = [];
        animationBox[0] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[1] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[2] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[3] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[4] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[5] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[6] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        animationBox[7] = new BABYLON.Animation("tutoAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var keys = [];
        keys.push({
            frame: 0,
            value: 0
        });

        keys.push({
            frame: 60,
            value: 2 * Math.PI
        });


        animationBox[0].setKeys(keys);
        animationBox[1].setKeys(keys);
        animationBox[2].setKeys(keys);
        animationBox[3].setKeys(keys);
        animationBox[4].setKeys(keys);
        animationBox[5].setKeys(keys);
        animationBox[6].setKeys(keys);
        animationBox[7].setKeys(keys);

        Ups[0].animations.push(animationBox[0]);
        Ups[1].animations.push(animationBox[1]);
        Ups[2].animations.push(animationBox[2]);
        Ups[3].animations.push(animationBox[3]);
        Ups[4].animations.push(animationBox[4]);
        Ups[5].animations.push(animationBox[5]);
        Ups[6].animations.push(animationBox[6]);
        Ups[7].animations.push(animationBox[7]);

        scene.beginAnimation(Ups[0], 0, 60, true);
        scene.beginAnimation(Ups[1], 0, 60, true);
        scene.beginAnimation(Ups[2], 0, 60, true);
        scene.beginAnimation(Ups[3], 0, 60, true);
        scene.beginAnimation(Ups[4], 0, 60, true);
        scene.beginAnimation(Ups[5], 0, 60, true);
        scene.beginAnimation(Ups[6], 0, 60, true);
        scene.beginAnimation(Ups[7], 0, 60, true);
    return Ups;
}

function createSkybox(scene) {
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/sky/sky", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

}

function RandomPower(tank) {
    if (tank.power !== "none")
        return tank.power;
    var r = Math.floor(Math.random() * 4);
    if (r === 0)
        return "SpeedBuff";
    if (r === 1)
        return "SpeedNerf";
    if (r === 2)
        return "CannonBall";
    if (r === 3)
        return "GooStain";
}
