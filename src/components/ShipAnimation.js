import { Box } from '@mui/material';
import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import {  Vector3 } from "three";
import {Loader, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

import Montserrat from "../fonts/Montserrat/static/Montserrat-Bold.ttf"
import Courier_Prime from "../fonts/Courier_Prime/CourierPrime-Regular.ttf"

import { ScrollControls, useScroll, Points, PointMaterial } from '@react-three/drei';

import * as random from '@react-three/drei/node_modules/maath/random/dist/maath-random.esm'


// Dummy target for camera lerp
const dummy = new Vector3()
// Mouse tracking library data
let trackedX;
let trackedY;
let width;
let height;
// Frame updated ship position
let x = 0;
let y = 0;


const DeathStar = () => {
    const fbx = useLoader(FBXLoader, require("../Death Star/Death Star.FBX"));

    const ref = useRef();
    useFrame(() => (ref.current.rotation.y += 0.005));

    const deathStarMesh = <mesh
        ref={ref}
        // Actual position
        position={[30, -1, 15]}
    >
        // Position around which the station rotates
        <primitive  object={fbx} scale={0.05} />
    </mesh>;

    return deathStarMesh;
};


const Cover = () => {
    return (
        <>
            <Text
                scale={[15, 15, 1]}
                position={[30, 25, 10]}
                color="white" // default
                font={Montserrat}
                letterSpacing={0.3}
            >
                CADEN
            </Text>
            <Text
                scale={[15, 15, 1]}
                position={[30, -25, 10]}
                color="white" // default
                font={Montserrat}
                letterSpacing={0.3}
            >
                JUANG
            </Text>
            <Text
                scale={[2, 2, 30]}
                position={[30, -40, 10]}
                color="white" // default
                font={Courier_Prime}
            >
                &gt;&gt;&gt;  scroll to fly &lt;&lt;&lt;
            </Text>
            <Text
                scale={[0.5, 0.5, 1]}
                position={[0, -5, 0]}
                color="white" // default
                font={Courier_Prime}
                letterSpacing={0.3}
            >
                &gt;&gt;&gt;  click to continue &lt;&lt;&lt;
            </Text>
        </>
    )
};



function Stars(props) {
    const ref = useRef();

    useFrame((state) => {ref.current.rotation.y += 0.004})

    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 200 }))
    return (
      <group >
        <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
          <PointMaterial transparent color="#ffffff" size={0.3} sizeAttenuation={true} depthWrite={false} />
        </Points>
      </group>
    )
}


const Ship = () => {
    const fbx = useLoader(FBXLoader, require("../X-Wing.fbx"));
    
    return (
        <mesh
            position={[0, 2, 15]}
            rotation={[0, Math.PI, 0]}
        >
            <primitive object={fbx} scale={0.001} />
        </mesh>
    );
};

const MouseTrackingShip = () => {

    const ref = useRef()
    useFrame(() => {
        if ((trackedX !== null && !isNaN(trackedX)) && (trackedY !== null && !isNaN(trackedY))) {
            const xFactor = width / 0.25;
            const yFactor = height / 0.15;
            const xHalf = width / 2;
            const yHalf = height / 2;
            let transformedX = (Math.abs(xHalf - trackedX) / xFactor) * ((trackedX < xHalf) ? -1 : 1);
            let transformedY = (Math.abs(yHalf - trackedY) / yFactor) * ((trackedY > yHalf) ? -1 : 1);
            transformedX /= 15;
            transformedY /= 15;
            x += (x < 0.35 && x > -0.35) ? transformedX : ((x >= 0) ? -0.0002 : 0.0002);
            y += (y < 0.15 && y > -0.15) ? transformedY : ((y >= 0) ? -0.0002 : 0.0002);
        } else {
            x += 0;
            x += 0;
        }

        ref.current.rotation.set(-y, x, 0)
    })

    return (
        <mesh ref={ref}>
            <Ship />
        </mesh>
    )
}

const Composition = () => {
    const scroll = useScroll()

    useFrame((state, delta) => {
        const offset = scroll.offset
        state.camera.position.set((30 - offset * 30), 2, (100 - offset * 80))
    })
    
    const ref = useRef()

    return (
        <>
            <directionalLight position={[10, 10, 5]} intensity={2} />
            <directionalLight position={[-10, -10, -5]} intensity={1} />
            <Suspense>
                <Cover/>
                <Stars/>
                <DeathStar />
                <MouseTrackingShip/>
            </Suspense>
        </>
    )
}

export default function Animation(props) {
    width = window.innerWidth;
    height = window.innerHeight;


    let navigate = useNavigate();

    function handleClick() {
        navigate('./home');
    }

    return (
        <div onMouseMove={(event) => {
            trackedX = event.clientX;
            trackedY = event.clientY;
        }}>

            <Box sx={{height:"100vh", backgroundColor:"black"}}>
                
                    <Canvas camera={{ fov: 70}} onClick={handleClick}>
                        <ScrollControls pages={5}>
                            <Composition/>
                        </ScrollControls>
                    </Canvas>
                    <Loader />
            </Box>
        </div>
    )
}
