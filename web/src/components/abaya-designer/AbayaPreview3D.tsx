import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AccumulativeShadows, ContactShadows, Environment, OrbitControls, RandomizedLight, Stage } from '@react-three/drei';
import * as THREE from 'three';
import type { AbayaDesignState } from '@/types/abaya-designer/abaya';
import { buildWornAbayaSceneWithWind } from '@/lib/abaya-designer/abayaMeshBuilder';
import { tickClothWind, type WindEntry } from '@/lib/abaya-designer/clothEffects';
import { calculateGarmentMeasurements } from '@/lib/abaya-designer/fitRules';

interface WornLookProps {
  design: AbayaDesignState;
}

function WornAbayaLook({ design }: WornLookProps) {
  const windRef = useRef<WindEntry[]>([]);

  const scene = useMemo(() => {
    const garment =
      design.garment ??
      calculateGarmentMeasurements(design.body, design.fit, design.style, design.fabric.fabric);
    const built = buildWornAbayaSceneWithWind(
      design.body,
      garment,
      design.style,
      design.fabric,
      design.fit
    );
    windRef.current = built.windRegistry;
    return built.scene;
  }, [design]);

  useFrame(({ clock }) => {
    tickClothWind(windRef.current, clock.elapsedTime, true);
  });

  return <primitive object={scene} />;
}

function ProfessionalStudio() {
  return (
    <>
      <color attach="background" args={['#8a9098']} />
      <fog attach="fog" args={['#8a9098', 14, 32]} />
      <Environment preset="warehouse" environmentIntensity={0.55} />
      <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={14} blur={2.5} far={5.5} color="#1a1520" />
      <AccumulativeShadows temporal frames={80} alphaTest={0.85} opacity={0.75} scale={12} color="#000000">
        <RandomizedLight amount={4} radius={9} intensity={0.55} position={[5, 8, 5]} bias={0.001} />
      </AccumulativeShadows>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#c8ccd4" roughness={0.22} metalness={0.15} />
      </mesh>
    </>
  );
}

export interface AbayaPreview3DProps {
  design: AbayaDesignState;
  exportRef?: React.MutableRefObject<THREE.Group | null>;
  className?: string;
  height?: number;
  autoRotate?: boolean;
}

export default function AbayaPreview3D({
  design,
  exportRef,
  className = '',
  height = 480,
  autoRotate = true,
}: AbayaPreview3DProps) {
  const exportScene = useMemo(() => {
    const garment =
      design.garment ??
      calculateGarmentMeasurements(design.body, design.fit, design.style, design.fabric.fabric);
    return buildWornAbayaSceneWithWind(
      design.body,
      garment,
      design.style,
      design.fabric,
      design.fit
    ).scene;
  }, [design]);

  useEffect(() => {
    if (exportRef) exportRef.current = exportScene;
  }, [exportRef, exportScene]);

  return (
    <div
      className={`cinematic-preview relative overflow-hidden rounded-2xl ${className}`}
      style={{ height }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.35, 1.55, 3.2], fov: 34, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
        }}
      >
        <Suspense fallback={null}>
          <ProfessionalStudio />
          <Stage
            intensity={0.45}
            environment={null}
            shadows="contact"
            adjustCamera={false}
            center={{ disableY: true }}
          >
            <WornAbayaLook design={design} />
          </Stage>
        </Suspense>
        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.35}
          minDistance={2.4}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 2.06}
          target={[0, 1.05, 0]}
        />
      </Canvas>
      <div className="cinematic-preview__vignette pointer-events-none absolute inset-0" aria-hidden="true" />
      <p className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-xs tracking-wide text-white/80">
        Professional preview · measurements shape the fit · drag to rotate
      </p>
    </div>
  );
}
