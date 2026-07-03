import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePointerParallax, useReducedMotion } from '../lib/hooks'

/**
 * A slow, weightless field of dust that drifts like particles suspended in
 * water. Fixed behind everything. It gently reacts to the pointer and, via the
 * `intensity` prop, breathes with the story — near-still at the open and close,
 * a little more alive during the wishes.
 */
export default function ParticleField({
  intensity = 1,
}: {
  intensity?: number
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const intensityRef = useRef(intensity)
  const parallax = usePointerParallax(1)
  const reduced = useReducedMotion()

  useEffect(() => {
    intensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    )
    camera.position.z = 22

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Two overlaid clouds: fine white dust + rarer warm-gold motes.
    const makeCloud = (count: number, spread: number, color: number, size: number) => {
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const speeds = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6
        speeds[i] = 0.2 + Math.random() * 0.8
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const sprite = makeDotTexture()
      const mat = new THREE.PointsMaterial({
        color,
        size,
        map: sprite,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
      const points = new THREE.Points(geo, mat)
      return { points, geo, positions, speeds, count }
    }

    const dust = makeCloud(reduced ? 240 : 620, 46, 0xffffff, 0.09)
    const gold = makeCloud(reduced ? 40 : 120, 40, 0xc9a24b, 0.16)
    scene.add(dust.points)
    scene.add(gold.points)

    const clock = new THREE.Clock()
    let raf = 0
    let disposed = false

    const animate = () => {
      if (disposed) return
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const k = intensityRef.current

      for (const cloud of [dust, gold]) {
        const pos = cloud.geo.attributes.position.array as Float32Array
        for (let i = 0; i < cloud.count; i++) {
          const idx = i * 3
          // Drift upward very slowly; sway sideways like a slow current.
          pos[idx + 1] += cloud.speeds[i] * 0.0016 * (0.4 + k * 0.6)
          pos[idx] += Math.sin(t * 0.12 + i) * 0.0009
          if (pos[idx + 1] > 24) pos[idx + 1] = -24
        }
        cloud.geo.attributes.position.needsUpdate = true
      }

      // Whole field rotates imperceptibly + eases toward the pointer.
      const targetX = parallax.current.x * 1.4
      const targetY = -parallax.current.y * 1.4
      camera.position.x += (targetX - camera.position.x) * 0.02
      camera.position.y += (targetY - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)
      dust.points.rotation.z = t * 0.006
      gold.points.rotation.z = -t * 0.004

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      dust.geo.dispose()
      gold.geo.dispose()
      ;(dust.points.material as THREE.Material).dispose()
      ;(gold.points.material as THREE.Material).dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}

/** A soft radial dot used as the point sprite. */
function makeDotTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}
