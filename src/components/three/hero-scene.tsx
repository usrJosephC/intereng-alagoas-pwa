"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./particle-field";

function useParticleCount() {
  const [count, setCount] = useState(60);
  useEffect(() => {
    const measure = () => setCount(window.innerWidth < 640 ? 35 : 60);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return count;
}

export function HeroScene() {
  const count = useParticleCount();
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      frameloop={reduced || !visible ? "demand" : "always"}
      style={{ position: "absolute", inset: 0 }}
    >
      <ParticleField key={count} count={count} reduced={reduced} />
    </Canvas>
  );
}
