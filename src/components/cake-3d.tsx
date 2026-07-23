import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, OrbitControls, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  color: string;
  accent: string;
  tiers: number;
  decorations: string[];
  message: string;
};

function Tier({ y, r, h, color, accent, top }: { y: number; r: number; h: number; color: string; accent: string; top?: boolean }) {
  return (
    <group position={[0, y, 0]}>
      {/* Sponge / frosting body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 96]} />
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} sheen={0.4} sheenColor={accent} />
      </mesh>
      {/* Gold rim */}
      <mesh position={[0, h / 2 + 0.001, 0]}>
        <torusGeometry args={[r, 0.02, 24, 96]} />
        <meshStandardMaterial color={accent} metalness={1} roughness={0.15} />
      </mesh>
      {/* Drip band */}
      <mesh position={[0, h / 2 - 0.05, 0]}>
        <cylinderGeometry args={[r + 0.005, r, 0.06, 96, 1, true]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      {/* Optional top berries on the topmost tier */}
      {top && (
        <group position={[0, h / 2, 0]}>
          {Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2;
            const rr = r * 0.55;
            return (
              <mesh key={i} position={[Math.cos(a) * rr, 0.04, Math.sin(a) * rr]}>
                <sphereGeometry args={[0.05, 24, 24]} />
                <meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

function CakeStack({ color, accent, tiers, decorations, message }: Props) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.35;
  });

  const heights = [0.55, 0.5, 0.45];
  const radii = [1.15, 0.85, 0.6];

  const stack = useMemo(() => {
    let y = 0;
    return Array.from({ length: tiers }).map((_, i) => {
      const idx = Math.min(i, heights.length - 1);
      const h = heights[idx];
      const r = radii[Math.min(idx, radii.length - 1)];
      const pos = y + h / 2;
      y += h;
      return { y: pos, r, h, top: i === tiers - 1 };
    });
  }, [tiers]);

  return (
    <group ref={group} position={[0, -0.9, 0]}>
      {/* Cake plate */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.55, 0.08, 96]} />
        <meshStandardMaterial color="#111" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.01, 0]}>
        <torusGeometry args={[1.5, 0.015, 20, 96]} />
        <meshStandardMaterial color={accent} metalness={1} roughness={0.15} />
      </mesh>

      {stack.map((s, i) => (
        <Tier key={i} {...s} color={color} accent={accent} />
      ))}

      {/* Gold leaf sparkles */}
      {decorations.includes("24K Gold Leaf") && (
        <group>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const y = 0.4 + (i % 3) * 0.35;
            const r = 1.2 - (i % 3) * 0.3;
            return (
              <Float key={i} speed={2 + (i % 3)} rotationIntensity={0.4} floatIntensity={0.3}>
                <mesh position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[Math.random(), Math.random(), Math.random()]}>
                  <planeGeometry args={[0.08, 0.12]} />
                  <meshStandardMaterial color={accent} metalness={1} roughness={0.15} side={THREE.DoubleSide} />
                </mesh>
              </Float>
            );
          })}
        </group>
      )}

      {/* Topper message */}
      {message && (
        <Text
          position={[0, (stack.at(-1)?.y ?? 0) + (stack.at(-1)?.h ?? 0) / 2 + 0.35, 0]}
          fontSize={0.16}
          color={accent}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {message}
        </Text>
      )}
    </group>
  );
}

export default function Cake3D(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [2.4, 1.6, 2.6], fov: 42 }}
      className="!h-full !w-full"
    >
      <color attach="background" args={["#0b0806"]} />
      <fog attach="fog" args={["#0b0806", 6, 12]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-3, 3, -2]} intensity={1.2} angle={0.5} penumbra={0.7} color={props.accent} />
      <CakeStack {...props} />
      <ContactShadows position={[0, -0.95, 0]} opacity={0.65} scale={6} blur={2.4} far={2} />
      <Environment preset="studio" />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3.5} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
