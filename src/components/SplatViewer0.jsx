import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { loadGaussianSplat } from '../utils/GaussianSplatLoader';

// Splatオブジェクトを管理するコンポーネント
const SplatObjects = ({ loadedSegments, segments, currentPosition }) => {
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
    }, [loadedSegments, scene, segments]);

    return null;
};

// カメラを現在位置に追従させる
const CameraController = ({ currentPosition }) => {
    const { camera } = useThree();

    useFrame(() => {
        // カメラを前方に移動
        camera.position.z = -currentPosition;
    });

    return null;
};

const SplatViewer = ({ currentPosition, currentSegment, loadedSegments, segments }) => {
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
                    currentPosition={currentPosition}
                />

                {/* カメラコントローラー */}
                <CameraController currentPosition={currentPosition} />

                {/* 手動カメラ操作用 */}
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

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
                    {segments[currentSegment]?.name}
                </div>
                <div>位置: {currentPosition.toFixed(1)} m</div>
                <div>セグメント: {currentSegment}</div>
                <div>ロード済み: {loadedSegments.size} / {segments.length}</div>
            </div>
        </div>
    );
};

export default SplatViewer;