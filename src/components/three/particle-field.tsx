"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Laranja/bronze oficiais + um branco quente esparso — mesma paleta da marca.
const COLORS = ["#e88e34", "#b5650d", "#eeaa67", "#f5ede0"];

// Hash pseudo-aleatório determinístico (mesma seed => mesmo valor sempre) — ao
// contrário de Math.random(), é uma função pura, então pode rodar dentro do
// useMemo/render sem violar a regra de pureza dos hooks.
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

export function ParticleField({ count, reduced }: { count: number; reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Distribuição esférica (raio 5-11) — profundidade sutil atrás do brasão.
      const radius = 5 + pseudoRandom(i * 12.9898 + 1) * 6;
      const theta = pseudoRandom(i * 78.233 + 2) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i * 39.425 + 3) - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 4;

      color.set(COLORS[i % COLORS.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, delta) => {
    if (reduced || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.035;
    groupRef.current.rotation.x += delta * 0.01;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}
