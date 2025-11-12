import * as THREE from 'three';

/**
 * Gaussian Splat ファイルをロードして Three.js オブジェクトを返す
 * .splat フォーマット: バイナリ形式で各スプラットのデータが格納されている
 * 
 * 各スプラットのデータ構造 (32 bytes):
 * - position: float32 x 3 (12 bytes)
 * - scale: float32 x 3 (12 bytes)  
 * - color: uint8 x 4 (4 bytes) - RGBA
 * - rotation: int8 x 4 (4 bytes) - quaternion
 */

export async function loadGaussianSplat(url, segmentId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        return parseSplatBuffer(buffer, segmentId);
    } catch (error) {
        console.error(`Error loading splat from ${url}:`, error);
        // エラー時はダミーオブジェクトを返す
        return createDummySplatObject(segmentId);
    }
}

function parseSplatBuffer(buffer, segmentId) {
    const dataView = new DataView(buffer);
    const splatSize = 32; // bytes per splat
    const splatCount = buffer.byteLength / splatSize;

    console.log(`Parsing ${splatCount} splats for segment ${segmentId}`);

    // ポイントクラウドとして表現
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(splatCount * 3);
    const colors = new Float32Array(splatCount * 3);
    const sizes = new Float32Array(splatCount);

    for (let i = 0; i < splatCount; i++) {
        const offset = i * splatSize;

        // Position (12 bytes)
        const x = dataView.getFloat32(offset, true);
        const y = dataView.getFloat32(offset + 4, true);
        const z = dataView.getFloat32(offset + 8, true);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Scale (12 bytes) - 平均サイズを使用
        const sx = dataView.getFloat32(offset + 12, true);
        const sy = dataView.getFloat32(offset + 16, true);
        const sz = dataView.getFloat32(offset + 20, true);
        sizes[i] = (sx + sy + sz) / 3;

        // Color (4 bytes) - RGBA
        const r = dataView.getUint8(offset + 24) / 255;
        const g = dataView.getUint8(offset + 25) / 255;
        const b = dataView.getUint8(offset + 26) / 255;

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    points.userData.segmentId = segmentId;

    return points;
}

function createDummySplatObject(segmentId) {
    // ダミーデータ: ランダムなポイントクラウド
    const count = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // セグメントごとに異なる色相
    const hue = (segmentId * 60) % 360;

    for (let i = 0; i < count; i++) {
        // 道路沿いに配置
        positions[i * 3] = (Math.random() - 0.5) * 10; // x: -5 to 5
        positions[i * 3 + 1] = Math.random() * 3; // y: 0 to 3
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z: -25 to 25

        // HSL to RGB conversion for varied colors
        const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.5 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    points.userData.segmentId = segmentId;
    points.userData.isDummy = true;

    console.log(`Created dummy splat object for segment ${segmentId}`);

    return points;
}