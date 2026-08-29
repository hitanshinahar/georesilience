import React, { useEffect, useRef, useState } from 'react';
import './EarthLoader.css';

export function EarthLoader({ onComplete }) {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing 3D Spatial Canvas...');
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const progressRef = useRef(0);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);

  // Sync state & ref
  const updateProgress = (val) => {
    const clamped = Math.min(100, Math.max(0, val));
    progressRef.current = clamped;
    setProgress(clamped);

    if (clamped < 25) setStatusMsg('Initializing 3D Spatial Canvas...');
    else if (clamped < 55) setStatusMsg('Loading 74,320 Cadastral Parcels (Khasra 104/A, 104/B, 108)...');
    else if (clamped < 80) setStatusMsg('Connecting Sentinel-1 SAR & Meteorological Feeds...');
    else if (clamped < 98) setStatusMsg('Calibrating Geotechnical Limit Equilibrium Engine...');
    else setStatusMsg('System Ready • Transitioning to Command Center...');
  };

  // Timer auto-advance (if user doesn't scroll)
  useEffect(() => {
    const interval = setInterval(() => {
      if (progressRef.current < 100) {
        updateProgress(progressRef.current + 2);
      } else {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Completion effect
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsZoomingOut(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Scroll Trigger Wheel & Touch Event Listener
  useEffect(() => {
    let lastTouchY = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      if (progressRef.current >= 100) return;
      
      const delta = e.deltaY > 0 ? Math.max(4, Math.abs(e.deltaY) * 0.08) : -3;
      updateProgress(progressRef.current + delta);

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.03;
      }
    };

    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (progressRef.current >= 100) return;
      const currentY = e.touches[0].clientY;
      const diff = lastTouchY - currentY;
      if (diff > 5) {
        updateProgress(progressRef.current + 5);
        lastTouchY = currentY;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        updateProgress(progressRef.current + 10);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Three.js 3D Earth Globe
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !window.THREE) return;

    const THREE = window.THREE;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x4466aa, 0.6);
    rimLight.position.set(-5, -1, -3);
    scene.add(rimLight);

    // Photorealistic Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x222222,
      shininess: 12
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.61, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudsMesh);

    // Blue Atmosphere Rayleigh Glow
    const atmGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 3.5);
          gl_FragColor = vec4(0.25, 0.55, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });
    const atmMesh = new THREE.Mesh(atmGeo, atmMat);
    globeGroup.add(atmMesh);

    // Load High-Res Textures
    const textureLoader = new THREE.TextureLoader();
    const cdnBase = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/';

    textureLoader.load(cdnBase + 'earth_atmos_2048.jpg', (tex) => {
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    });

    textureLoader.load(cdnBase + 'earth_specular_2048.jpg', (tex) => {
      earthMat.specularMap = tex;
      earthMat.needsUpdate = true;
    });

    textureLoader.load(cdnBase + 'earth_normal_2048.jpg', (tex) => {
      earthMat.normalMap = tex;
      earthMat.normalScale = new THREE.Vector2(0.5, 0.5);
      earthMat.needsUpdate = true;
    });

    textureLoader.load(cdnBase + 'earth_clouds_1024.png', (tex) => {
      cloudMat.map = tex;
      cloudMat.needsUpdate = true;
    });

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Idle spin + clouds movement
      globeGroup.rotation.y += 0.002;
      cloudsMesh.rotation.y += 0.0028;

      // Scroll-driven camera zoom smoothly towards Earth
      const targetZ = 5.2 - (progressRef.current / 100) * 2.8;
      camera.position.z += (targetZ - camera.position.z) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleSkip = () => {
    updateProgress(100);
    setIsZoomingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <div className={`earth-loader-overlay ${isZoomingOut ? 'fade-out' : ''}`}>
      <div className="stars-bg"></div>
      <div className="globe-canvas-container" ref={mountRef}></div>

      <div className="loader-ui-container">
        <div className="gov-badge">
          <span className="flag-icon">🇮🇳</span> GOVT OF INDIA • MDoNER × MoRD | GeoShield
        </div>

        <h1 className="hero-title">Resilience in Every Khasra</h1>
        <p className="hero-subtitle">National Disaster Resilience & Landslide Risk Analytics Platform</p>

        <div className="progress-section">
          <div className="progress-bar-wrapper">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            <div className="progress-glow" style={{ left: `${progress}%` }}></div>
          </div>
          
          <div className="progress-info">
            <span className="status-text">{statusMsg}</span>
            <span className="percentage-text">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="scroll-cue-container">
          <span className="scroll-cue-text">Scroll down or wait to zoom into Earth ↓</span>
          <div className="scroll-mouse-icon">
            <div className="scroll-wheel-dot"></div>
          </div>
        </div>

        <button className="skip-btn" onClick={handleSkip}>
          Enter Command Center Immediately →
        </button>
      </div>
    </div>
  );
}
