import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { loadGaussianSplat } from '../utils/GaussianSplatLoader';

// Splatオブジェクトを管理するコンポーネント
const SplatObjects = ({ loadedSegments, segments }) => {
    const { scene } = useThree();
    const splatCacheRef = useRef({});
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        // ロードするべきセグメント
        loadedSegments.forEach(async (segmentId) => {
            if (splatCacheRef.current[segmentId]) return;
            if (loadingStates[segmentId]) return;

            setLoadingStates(prev => ({ ...prev, [segmentId]: 'loading' }));

            try {
                console.log(`[Loading] ${segments[segmentId].file}`);
                const splatObject = await loadGaussianSplat(
                    `/splats/${segments[segmentId].file}`,
                    segmentId
                );

                // セグメントの開始位置に配置
                splatObject.position.z = -segments[segmentId].start;

                scene.add(splatObject);
                splatCacheRef.current[segmentId] = splatObject;

                setLoadingStates(prev => ({ ...prev, [segmentId]: 'loaded' }));
                console.log(`[Loaded] Segment ${segmentId}`);
            } catch (error) {
                console.error(`[Error] Failed to load segment ${segmentId}:`, error);
                setLoadingStates(prev => ({ ...prev, [segmentId]: 'error' }));
            }
        });

        // アンロードするべきセグメント
        Object.keys(splatCacheRef.current).forEach((segmentId) => {
            const id = parseInt(segmentId);
            if (!loadedSegments.has(id)) {
                const splatObject = splatCacheRef.current[id];
                scene.remove(splatObject);

                // メモリ解放
                if (splatObject.geometry) splatObject.geometry.dispose();
                if (splatObject.material) splatObject.material.dispose();

                delete splatCacheRef.current[id];
                console.log(`[Disposed] Segment ${id}`);
            }
        });
    }, [loadedSegments, scene, segments, loadingStates]);

    return null;
};

// カメラコントローラー（モード対応）
const CameraController = ({ mode, currentPosition, onPositionChange }) => {
    const { camera } = useThree();
    const moveSpeed = useRef(0.3);
    const keysPressed = useRef({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e) => {
            keysPressed.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame(() => {
        if (mode === 'auto') {
            // 自動モード: 指定された位置に移動
            camera.position.z = -currentPosition;
        } else if (mode === 'free') {
            // フリーモード: キーボードで移動
            const direction = new THREE.Vector3();
            const right = new THREE.Vector3();

            camera.getWorldDirection(direction);
            right.crossVectors(camera.up, direction).normalize();

            // W/S: 前後移動
            if (keysPressed.current['w']) {
                camera.position.addScaledVector(direction, -moveSpeed.current);
            }
            if (keysPressed.current['s']) {
                camera.position.addScaledVector(direction, moveSpeed.current);
            }

            // A/D: 左右移動
            if (keysPressed.current['a']) {
                camera.position.addScaledVector(right, moveSpeed.current);
            }
            if (keysPressed.current['d']) {
                camera.position.addScaledVector(right, -moveSpeed.current);
            }

            // Q/E: 上下移動
            if (keysPressed.current['q']) {
                camera.position.y += moveSpeed.current;
            }
            if (keysPressed.current['e']) {
                camera.position.y -= moveSpeed.current;
            }

            // Shift: 高速移動
            moveSpeed.current = keysPressed.current['shift'] ? 0.6 : 0.3;

            // 現在位置を更新（Z座標の絶対値をセグメント位置として使用）
            onPositionChange(Math.abs(camera.position.z));
        }
    });

    return null;
};

const SplatViewer = ({
    currentPosition,
    currentSegment,
    loadedSegments,
    segments,
    mode = 'auto',
    onPositionChange
}) => {
    return (
        <div style={{ flex: 1, position: 'relative', background: '#1a1a2e' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 0]} fov={75} />

                {/* ライティング */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Gaussian Splat オブジェクト */}
                <SplatObjects
                    loadedSegments={loadedSegments}
                    segments={segments}
                />

                {/* カメラコントローラー */}
                <CameraController
                    mode={mode}
                    currentPosition={currentPosition}
                    onPositionChange={onPositionChange || (() => { })}
                />

                {/* フリーモード時のマウスコントロール */}
                {mode === 'free' && <PointerLockControls />}

                {/* グリッド表示（デバッグ用） */}
                <gridHelper args={[1000, 100]} position={[0, 0, 0]} />

                {/* 道路の簡易表現 */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <planeGeometry args={[10, 1000]} />
                    <meshStandardMaterial color="#2a2a3e" />
                </mesh>

                {/* 道路の白線 */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <planeGeometry args={[0.2, 1000]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </Canvas>

            {/* HUD: 現在のセグメント情報 */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                }}
            >
                <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    {mode === 'auto' ? '🚗 自動モード' : '🎮 フリーモード'}
                </div>
                <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    {segments[currentSegment]?.name}
                </div>
                <div>位置: {currentPosition.toFixed(1)} m</div>
                <div>セグメント: {currentSegment}</div>
                <div>ロード済み: {loadedSegments.size} / {segments.length}</div>

                {mode === 'free' && (
                    <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '8px' }}>
                        <div>W/A/S/D: 移動</div>
                        <div>Q/E: 上下</div>
                        <div>Shift: 高速移動</div>
                        <div>マウス: 視点変更</div>
                        <div style={{ color: '#00d4ff', marginTop: '5px' }}>
                            クリックでマウスロック
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SplatViewer;
