import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Ballpit({
 count = 100,
  colors = ["#ec4899", "#f472b6", "#3b82f6", "#60a5fa"],
  followCursor = true,
  minSize = 0.18,
  maxSize = 0.35,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let animationId;
    let observer;
    let disposed = false;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      1,
      0.1,
      100
    );
    camera.position.z = 15;

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "default",
      });
    } catch (error) {
      console.error("Ballpit WebGL initialization failed:", error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const light = new THREE.PointLight(0xffffff, 30);
    light.position.set(0, 5, 10);
    scene.add(light);

    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const balls = [];

    const ballColors =
      colors.length > 0 ? colors : ["#ec4899"];

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: ballColors[i % ballColors.length],
        roughness: 0.4,
        metalness: 0.05,
      });

      const ball = new THREE.Mesh(geometry, material);

      ball.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4
      );

      ball.userData.velocity = {
        x: (Math.random() - 0.5) * 0.025,
        y: (Math.random() - 0.5) * 0.025,
      };

      scene.add(ball);
      balls.push(ball);
    }

    const pointer = new THREE.Vector2(0, 0);

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

      pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    if (followCursor) {
      container.addEventListener(
        "pointermove",
        handlePointerMove
      );
    }

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height || disposed) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const animate = () => {
      if (disposed) return;

      animationId = requestAnimationFrame(animate);

      for (const ball of balls) {
        const velocity = ball.userData.velocity;

        ball.position.x += velocity.x;
        ball.position.y += velocity.y;

        if (ball.position.x > 9 || ball.position.x < -9) {
          velocity.x *= -1;
        }

        if (ball.position.y > 5 || ball.position.y < -5) {
          velocity.y *= -1;
        }

        if (followCursor) {
          const targetX = pointer.x * 7;
          const targetY = pointer.y * 4;

          const dx = ball.position.x - targetX;
          const dy = ball.position.y - targetY;
          const distance = Math.hypot(dx, dy);

          if (distance < 2) {
            ball.position.x += dx * 0.008;
            ball.position.y += dy * 0.008;
          }
        }

        ball.rotation.x += 0.003;
        ball.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      observer?.disconnect();

      container.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });

      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [count, colors, followCursor]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
    />
  );
}

