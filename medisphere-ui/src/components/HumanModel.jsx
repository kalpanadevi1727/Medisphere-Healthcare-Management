import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Center,
} from "@react-three/drei";
import * as THREE from "three";

function Human() {
  const { scene } = useGLTF("/models/human.glb");

  // Apply gray material to every mesh
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: "#d9d9d9",
        metalness: 0.2,
        roughness: 0.7,
      });

      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <Center>
      <primitive
        object={scene}
        scale={2}
        position={[0, 1.4, 0]}
      />
    </Center>
  );
}

export default function HumanModel() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 0, 36],
        fov: 75,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "#111111",
      }}
    >
      {/* Lights */}
      <ambientLight intensity={1.2} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
        castShadow
      />

      <directionalLight
        position={[-5, 5, -5]}
        intensity={1}
      />

      <spotLight
        position={[0, 10, 10]}
        angle={0.35}
        intensity={2}
        penumbra={1}
        castShadow
      />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Human */}
      <Human />

      {/* Controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={1}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/human.glb");