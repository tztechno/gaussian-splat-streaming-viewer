import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ダミーの.splatファイルを生成するスクリプト
 * 
 * .splat フォーマット (バイナリ):
 * 各スプラット 32 bytes:
 * - position: float32 x 3 (12 bytes)
 * - scale: float32 x 3 (12 bytes)
 * - color: uint8 x 4 (4 bytes)
 * - rotation: int8 x 4 (4 bytes)
 */

function generateDummySplat(splatCount, segmentId) {
    const splatSize = 32;
    const buffer = Buffer.alloc(splatCount * splatSize);

    // セグメントごとに異なる特徴を持たせる
    const hue = (segmentId * 60) % 360;
    const offsetZ = segmentId * 100; // セグメントごとにZ方向にオフセット

    for (let i = 0; i < splatCount; i++) {
        const offset = i * splatSize;

        // Position (12 bytes) - 道路沿いに配置
        const x = (Math.random() - 0.5) * 15; // -7.5 to 7.5m
        const y = Math.random() * 4; // 0 to 4m (建物の高さ)
        const z = (Math.random() - 0.5) * 100; // このセグメント内で分散

        buffer.writeFloatLE(x, offset);
        buffer.writeFloatLE(y, offset + 4);
        buffer.writeFloatLE(z, offset + 8);

        // Scale (12 bytes) - スプラットのサイズ
        const scale = 0.1 + Math.random() * 0.2;
        buffer.writeFloatLE(scale, offset + 12);
        buffer.writeFloatLE(scale, offset + 16);
        buffer.writeFloatLE(scale, offset + 20);

        // Color (4 bytes RGBA)
        const color = hslToRgb(hue / 360, 0.6, 0.4 + Math.random() * 0.4);
        buffer.writeUInt8(Math.floor(color.r * 255), offset + 24);
        buffer.writeUInt8(Math.floor(color.g * 255), offset + 25);
        buffer.writeUInt8(Math.floor(color.b * 255), offset + 26);
        buffer.writeUInt8(255, offset + 27); // Alpha

        // Rotation (4 bytes) - クォータニオン (簡略化のため単位クォータニオン)
        buffer.writeInt8(0, offset + 28);
        buffer.writeInt8(0, offset + 29);
        buffer.writeInt8(0, offset + 30);
        buffer.writeInt8(127, offset + 31); // w = 1.0 (127/127)
    }

    return buffer;
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r, g, b };
}

// メイン処理
const outputDir = path.join(__dirname, '../../public/splats');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 5つのセグメント用のダミーデータを生成
const segments = [
    { id: 0, count: 8000, name: 'segment_0.splat' },
    { id: 1, count: 10000, name: 'segment_1.splat' },
    { id: 2, count: 12000, name: 'segment_2.splat' },
    { id: 3, count: 9000, name: 'segment_3.splat' },
    { id: 4, count: 7000, name: 'segment_4.splat' },
];

segments.forEach(seg => {
    const buffer = generateDummySplat(seg.count, seg.id);
    const filePath = path.join(outputDir, seg.name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Generated ${seg.name} (${seg.count} splats, ${(buffer.length / 1024).toFixed(2)} KB)`);
});

console.log('\n✅ All dummy splat files generated successfully!');
console.log(`📁 Output directory: ${outputDir}`);