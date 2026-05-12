"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";

// Функция плавности анимации (можно не трогать)
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function RubiksLogic() {
  const cubeRefs = useRef<THREE.Mesh[]>([]);

  // Геометрия кубиков (скругление углов)
  const sharedGeometry = useMemo(
    () => new RoundedBoxGeometry(1.0, 1.0, 1.0, 6, 0.25),[]
  );
  
  // ——————————————————————————————————————————————————————————————————————————
  // НАСТРОЙКИ МАТЕРИАЛА (САМОГО КУБА)
  // ——————————————————————————————————————————————————————————————————————————
  const sharedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // 1. БАЗОВЫЙ ЦВЕТ: Если куб слишком белый — сделайте этот цвет темнее (напр. #1e293b)
        color: "#e4e4e7", 

        // 2. МЕТАЛЛИЧНОСТЬ (0...1): 1.0 — чистый хром, отражает всё вокруг
        metalness: 0.96,  

        // 3. ШЕРШАВОСТЬ (0...1): 0.1 — зеркало, 0.5 — матовый алюминий
        roughness: 0.1,  

        // 4. СИЛА ОТРАЖЕНИЙ: Насколько сильно куб впитывает свет от окружения (Environment)
        // Если куб кажется "белым пятном" — уменьшайте этот параметр до 0.1 или 0.2
        envMapIntensity: 0.1, 
      }),[]
  );

  const cubeData = useMemo(() => {
    const data =[];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          data.push({
            pos: new THREE.Vector3(x, y, z),
            rot: new THREE.Quaternion(),
          });
        }
      }
    }
    return data;
  },[]);

  const animState = useRef({
    active: false,
    progress: 0,
    axis: "x" as "x" | "y" | "z",
    slice: 0,
    direction: 1,
    duration: 1.2,
    cooldown: 0.4,
    cooldownTimer: 0,
  });

  const axisVectors = useMemo(
    () => ({
      x: new THREE.Vector3(1, 0, 0),
      y: new THREE.Vector3(0, 1, 0),
      z: new THREE.Vector3(0, 0, 1),
    }),[]
  );

  useFrame((_, delta) => {
    const anim = animState.current;
    if (!anim.active) {
      if (anim.cooldownTimer > 0) {
        anim.cooldownTimer -= delta;
        return;
      }
      const axes: ("x" | "y" | "z")[] = ["x", "y", "z"];
      anim.axis = axes[Math.floor(Math.random() * axes.length)];
      anim.slice = Math.floor(Math.random() * 3) - 1;
      anim.direction = Math.random() > 0.5 ? 1 : -1;
      anim.progress = 0;
      anim.active = true;
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
          mesh.position.copy(data.pos);
          mesh.quaternion.copy(data.rot);
        }
      });
      if (finished) {
        cubeData.forEach((data) => {
          if (Math.abs(data.pos[anim.axis] - anim.slice) < 0.1) {
            data.pos.applyAxisAngle(axisVec, (Math.PI / 2) * anim.direction);
            data.pos.x = Math.round(data.pos.x);
            data.pos.y = Math.round(data.pos.y);
            data.pos.z = Math.round(data.pos.z);
            const q = new THREE.Quaternion().setFromAxisAngle(axisVec, (Math.PI / 2) * anim.direction);
            data.rot.copy(q.multiply(data.rot));
          }
        });
        anim.active = false;
        anim.cooldownTimer = anim.cooldown;
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
  return (
    <div className="w-[180px] h-[200px] md:w-[260px] md:h-[280px] mx-auto cursor-grab active:cursor-grabbing relative z-10">
      <Canvas
        camera={{ position: [6.75, 5.25, 6.75], fov: 25 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* ——————————————————————————————————————————————————————————————————————
            БЛОК ОСВЕЩЕНИЯ (ЛАМПЫ)
        —————————————————————————————————————————————————————————————————————— */}

        {/* 1. ОБЩИЙ СВЕТ: Освещает всё равномерно. Ставьте 0.1-0.2, если хотите тьму. */}
        <ambientLight intensity={0.7} />

        {/* 2. БЕЛЫЙ БЛИК: Дает жесткое отражение металла. 
               Если куб слишком белый — уменьшите intensity до 0.5 или 0 */}
        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />

        {/* 3. ЦВЕТНЫЕ ПРОЖЕКТОРЫ: Светят на каждую грань отдельно (Верх, Право, Перед)
               Крутите intensity, чтобы менять насыщенность цвета на металле. */}
        
        {/* ВЕРХНЯЯ ГРАНЬ: Голубой */}
        <directionalLight position={[0, 10, 0]} intensity={10} color="#00129c" />
        
        {/* ПРАВАЯ ГРАНЬ: Фиолетовый */}
        <directionalLight position={[10, 0, 0]} intensity={10} color="#e5b2ff" />
        
        {/* ЛЕВАЯ/ПЕРЕДНЯЯ ГРАНЬ: Синий */}
        <directionalLight position={[0, 0, 10]} intensity={10} color="#3c00bc" />


        <Suspense fallback={null}>
          {/* ——————————————————————————————————————————————————————————————————————
              КАРТА ОКРУЖЕНИЯ: Металлу нужно что-то отражать, иначе он будет черным.
              Варианты пресетов: "city", "night", "studio", "sunset", "park"
              "night" сделает куб темнее, "city" — светлее.
          —————————————————————————————————————————————————————————————————————— */}
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