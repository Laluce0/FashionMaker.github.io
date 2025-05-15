import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function CustomOrbitControls({ enableDamping = true, dampingFactor = 0.1, zoomRate = 0.002 }) {
  const controlsRef = useRef()
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const domElement = gl.domElement

  // 使用 ref 管理状态，避免闭包捕获旧值
  const isShiftPressedRef = useRef(false)
  const isRightMouseDownRef = useRef(false)
  const modeRef = useRef(null)

  const lastTouchPosRef = useRef(null)
  const lastTouchDistanceRef = useRef(0)

  // 键盘 shift 监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey) isShiftPressedRef.current = true
    }
    const handleKeyUp = (e) => {
      isShiftPressedRef.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 处理鼠标事件
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 2 || e.buttons === 2) {
        console.log('🖱️ Mouse Right Button Down')
        e.preventDefault()
        e.stopPropagation()

        isRightMouseDownRef.current = true
        modeRef.current = isShiftPressedRef.current ? 'pan' : 'rotate'
      }
    }

    const handleMouseMove = (e) => {
      console.log(`Move Raw: ${e.movementX}, ${e.movementY} | Mode: ${modeRef.current}`)

      if (!controlsRef.current) {
        console.warn('⚠️ controlsRef.current is null!')
        return
      }

      if (!isRightMouseDownRef.current) {
        console.warn('⚠️ isRightMouseDown is false!')
        return
      }

      console.log(`Proceeding with mode: ${modeRef.current}`)

      if (modeRef.current === 'rotate') {
        rotateCamera(e)
      } else if (modeRef.current === 'pan') {
        panCamera(e.movementX, e.movementY)
      }
    }

    const handleMouseUp = (e) => {
      if (e.button === 2 || e.buttons === 2) {
        console.log('mouseup triggered')
        isRightMouseDownRef.current = false
        modeRef.current = null
      }
    }

    const handleWheel = (e) => {
      if (!controlsRef.current) return
      zoomCamera(camera.zoom - e.deltaY * zoomRate)
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    domElement.addEventListener('mousedown', handleMouseDown)
    domElement.addEventListener('mousemove', handleMouseMove)
    domElement.addEventListener('mouseup', handleMouseUp)
    domElement.addEventListener('wheel', handleWheel)
    domElement.addEventListener('contextmenu', handleContextMenu)

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown)
      domElement.removeEventListener('mousemove', handleMouseMove)
      domElement.removeEventListener('mouseup', handleMouseUp)
      domElement.removeEventListener('wheel', handleWheel)
      domElement.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [domElement])

  // 处理触摸事件
  useEffect(() => {
    const handleTouchStart = (e) => {
      lastTouchPosRef.current = null
      lastTouchDistanceRef.current = 0

      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        lastTouchDistanceRef.current = Math.hypot(dx, dy)

        if (isShiftPressedRef.current) {
          modeRef.current = 'pan'
        } else {
          modeRef.current = 'zoom'
        }
      } else if (e.touches.length === 1) {
        modeRef.current = 'rotate'
        lastTouchPosRef.current = null
      }
    }

    const handleTouchMove = (e) => {
      if (!controlsRef.current) return

      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]

        if (modeRef.current === 'zoom') {
          // 双指上下滑动缩放
          const currentY = (touch1.clientY + touch2.clientY) / 2
          if (lastTouchPosRef.current) {
            const deltaY = currentY - lastTouchPosRef.current.y
            zoomCamera(camera.zoom - deltaY * zoomRate)
          }
          lastTouchPosRef.current = { x: (touch1.clientX + touch2.clientX) / 2, y: currentY }
        } else if (modeRef.current === 'pan') {
          // Shift + 双指拖拽平移
          const moveX = (touch1.clientX - touch2.clientX) * 0.001
          const moveY = (touch1.clientY - touch2.clientY) * 0.001
          panCamera(moveX, moveY)
        } else {
          // 双指拖拽旋转
          const avgX = (touch1.clientX + touch2.clientX) / 2
          const avgY = (touch1.clientY + touch2.clientY) / 2
          if (lastTouchPosRef.current) {
            const deltaX = avgX - lastTouchPosRef.x
            const deltaY = avgY - lastTouchPosRef.y
            rotateCamera({ movementX: deltaX, movementY: deltaY })
          }
          lastTouchPosRef.current = { x: avgX, y: avgY }
        }
      } else if (e.touches.length === 1) {
        // 单指旋转
        const touch = e.touches[0]
        if (lastTouchPosRef.current) {
          const deltaX = touch.clientX - lastTouchPosRef.x
          const deltaY = touch.clientY - lastTouchPosRef.y
          rotateCamera({ movementX: deltaX, movementY: deltaY })
        }
        lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    const handleTouchEnd = () => {
      modeRef.current = null
      lastTouchPosRef.current = null
      lastTouchDistanceRef.current = 0
    }

    domElement.addEventListener('touchstart', handleTouchStart)
    domElement.addEventListener('touchmove', handleTouchMove)
    domElement.addEventListener('touchend', handleTouchEnd)

    return () => {
      domElement.removeEventListener('touchstart', handleTouchStart)
      domElement.removeEventListener('touchmove', handleTouchMove)
      domElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [domElement])

  // 控制器更新
  useFrame(() => {
    if (controlsRef.current && enableDamping) {
      controlsRef.current.update()
    }
  })

  // 工具函数 ——————————————————————

  const rotateCamera = (e) => {
    if (!controlsRef.current) return

    const spherical = controlsRef.current.getAzimuthalAngle()
    const phi = controlsRef.current.getPolarAngle()

    const sensitivity = 0.05
    const deltaAzimuth = -e.movementX * sensitivity
    const deltaPolar = -e.movementY * sensitivity

    controlsRef.current.setAzimuthalAngle(spherical + deltaAzimuth)
    controlsRef.current.setPolarAngle(phi + deltaPolar)
  }

  const panCamera = (x, y) => {
    if (!controlsRef.current) return

    const controls = controlsRef.current
    const camera = controls.object
    const target = controls.target.clone()

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
    const up = new THREE.Vector3(0, 1, 0)

    const panSpeed = 0.01
    const moveX = x * panSpeed
    const moveY = y * panSpeed

    const translation = new THREE.Vector3()
    translation.addScaledVector(right, moveX)
    translation.addScaledVector(up, moveY)

    target.add(translation)
    controls.target.copy(target)
  }

  const zoomCamera = (zoom) => {
    if (!controlsRef.current) return

    const clampedZoom = THREE.MathUtils.clamp(zoom, 0.1, 10)
    controlsRef.current.object.zoom = clampedZoom
    controlsRef.current.object.updateProjectionMatrix()
  }

  // 返回禁用默认交互的 OrbitControls
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault={false}
      enableRotate={false}
      enableZoom={false}
      enablePan={false}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  )
}