"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
// ИМПОРТИРУЕМ хук для отслеживания видимости:
import { useInView } from "framer-motion";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function RubiksLogic() {
  const cubeRefs = useRef<THREE.Mesh[]>([]);

  // ВЕРНУЛИ НА 6 СЕГМЕНТОВ: Идеально круглые углы!
  const sharedGeometry = useMemo(
    () => new RoundedBoxGeometry(1.0, 1.0, 1.0, 6, 0.25), []
  );
  
  const sharedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e4e4e7", 
        metalness: 0.96,  
        roughness: 0.1,  
        envMapIntensity: 0.1, 
      }), []
  );

  const cubeData = useMemo(() => {
    const data = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          data.push({ pos: new THREE.Vector3(x, y, z), rot: new THREE.Quaternion() });
        }
      }
    }
    return data;
  }, []);

  const animState = useRef({
    active: false, progress: 0, axis: "x" as "x" | "y" | "z", slice: 0,
    direction: 1, duration: 1.2, cooldown: 0.4, cooldownTimer: 0,
  });

  const axisVectors = useMemo(() => ({
      x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1),
    }), []
  );

  useFrame((_, delta) => {
    const anim = animState.current;
    if (!anim.active) {
      if (anim.cooldownTimer > 0) { anim.cooldownTimer -= delta; return; }
      const axes: ("x" | "y" | "z")[] = ["x", "y", "z"];
      anim.axis = axes[Math.floor(Math.random() * axes.length)];
      anim.slice = Math.floor(Math.random() * 3) - 1;
      anim.direction = Math.random() > 0.5 ? 1 : -1;
      anim.progress = 0; anim.active = true;
    }
    if (anim.active) {
      anim.progress += delta / anim.duration;
      let finished = false;
      let t = anim.progress;
      if (t >= 1) { t = 1; finished = true; }
      const easedT = easeInOutCubic(t);
      const angle = easedT * (Math.PI / 2) * anim.direction;
      const axisVec = axisVectors[anim.axis];
      cubeData.forEach((data, i) => {
        const mesh = cubeRefs.current[i];
        if (!mesh) return;
        if (Math.abs(data.pos[anim.axis] - anim.slice) < 0.1) {
          const tempPos = data.pos.clone().applyAxisAngle(axisVec, angle);
          mesh.position.copy(tempPos);
          const tempRot = new THREE.Quaternion().setFromAxisAngle(axisVec, angle).multiply(data.rot);
          mesh.quaternion.copy(tempRot);
        } else {
          mesh.position.copy(data.pos); mesh.quaternion.copy(data.rot);
        }
      });
      if (finished) {
        cubeData.forEach((data) => {
          if (Math.abs(data.pos[anim.axis] - anim.slice) < 0.1) {
            data.pos.applyAxisAngle(axisVec, (Math.PI / 2) * anim.direction);
            data.pos.x = Math.round(data.pos.x); data.pos.y = Math.round(data.pos.y); data.pos.z = Math.round(data.pos.z);
            const q = new THREE.Quaternion().setFromAxisAngle(axisVec, (Math.PI / 2) * anim.direction);
            data.rot.copy(q.multiply(data.rot));
          }
        });
        anim.active = false; anim.cooldownTimer = anim.cooldown;
      }
    }
  });

  return (
    <group>
      {cubeData.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) cubeRefs.current[i] = el; }}
          geometry={sharedGeometry}
          material={sharedMaterial}
        />
      ))}
    </group>
  );
}

export function SilverRubiksCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Отслеживаем видимость. margin: "400px" значит, что куб "проснется" 
  // когда до него останется 400 пикселей скролла (с запасом, чтобы без дерганий).
  const isInView = useInView(containerRef, { margin: "400px" });

  return (
    <div ref={containerRef} className="w-[180px] h-[200px] md:w-[260px] md:h-[280px] mx-auto cursor-grab active:cursor-grabbing relative z-10">
      <Canvas
        // Если куб в зоне видимости - рендерим кадры всегда ("always"). Если скрылся - ставим на паузу ("demand")
        frameloop={isInView ? "always" : "demand"}
        
        // Ограничиваем Pixel Ratio (спасает батарею на Макбуках и Айфонах)
        dpr={[1, 1.5]} 
        camera={{ position: [6.75, 5.25, 6.75], fov: 25 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <directionalLight position={[0, 10, 0]} intensity={10} color="#00129c" />
        <directionalLight position={[10, 0, 0]} intensity={10} color="#e5b2ff" />
        <directionalLight position={[0, 0, 10]} intensity={10} color="#3c00bc" />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Float speed={2} rotationIntensity={0.1} floatIntensity={1.0}>
            <group scale={0.9}>
              <RubiksLogic />
            </group>
          </Float>
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}