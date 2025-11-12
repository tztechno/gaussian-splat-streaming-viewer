import React from 'react';

const ControlPanel = ({
    mode,
    onModeChange,
    isPlaying,
    setIsPlaying,
    currentPosition,
    currentSegment,
    loadedSegments,
    segments,
    speed,
    setSpeed,
    onSkip,
    onPositionChange,
}) => {
    const maxPosition = segments[segments.length - 1]?.end || 500;

    const handleSliderChange = (e) => {
        onPositionChange(parseFloat(e.target.value));
    };

    return (
        <div
            style={{
                minHeight: '280px',
                background: '#16213e',
                padding: '20px',
                color: 'white',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            {/* モード切替ボタン */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                <button
                    onClick={() => onModeChange('auto')}
                    style={{
                        padding: '10px 20px',
                        background: mode === 'auto' ? '#00d4ff' : '#0f3460',
                        border: mode === 'auto' ? '2px solid #fff' : '2px solid transparent',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                    }}
                >
                    🚗 自動モード
                </button>

                <button
                    onClick={() => onModeChange('free')}
                    style={{
                        padding: '10px 20px',
                        background: mode === 'free' ? '#00d4ff' : '#0f3460',
                        border: mode === 'free' ? '2px solid #fff' : '2px solid transparent',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                    }}
                >
                    🎮 フリーモード
                </button>
            </div>

            {/* 自動モード時のコントロール */}
            {mode === 'auto' && (
                <>
                    {/* 再生コントロール */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        <button
                            onClick={() => onSkip(-1)}
                            disabled={currentSegment === 0}
                            style={{
                                padding: '12px 20px',
                                background: currentSegment === 0 ? '#555' : '#0f3460',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: currentSegment === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}
                        >
                            ⏮ 前のセグメント
                        </button>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                padding: '12px 30px',
                                background: isPlaying ? '#e94560' : '#00d4ff',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                minWidth: '120px',
                            }}
                        >
                            {isPlaying ? '⏸ 停止' : '▶ 再生'}
                        </button>

                        <button
                            onClick={() => onSkip(1)}
                            disabled={currentSegment === segments.length - 1}
                            style={{
                                padding: '12px 20px',
                                background: currentSegment === segments.length - 1 ? '#555' : '#0f3460',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: currentSegment === segments.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}
                        >
                            次のセグメント ⏭
                        </button>
                    </div>

                    {/* プログレスバー */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                            <span>0 m</span>
                            <span>{currentPosition.toFixed(1)} m</span>
                            <span>{maxPosition} m</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxPosition}
                            step="0.1"
                            value={currentPosition}
                            onChange={handleSliderChange}
                            style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '4px',
                                background: `linear-gradient(to right, #00d4ff ${(currentPosition / maxPosition) * 100}%, #0f3460 ${(currentPosition / maxPosition) * 100}%)`,
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        />
                    </div>

                    {/* 速度コントロール */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px' }}>速度</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{speed} m/s</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                height: '6px',
                                cursor: 'pointer',
                            }}
                        />
                    </div>

                    {/* セグメント一覧 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                        {segments.map((seg) => {
                            const isActive = currentSegment === seg.id;
                            const isLoaded = loadedSegments.has(seg.id);

                            return (
                                <div
                                    key={seg.id}
                                    onClick={() => onPositionChange(seg.start + 10)}
                                    style={{
                                        padding: '10px',
                                        background: isActive ? '#00d4ff' : isLoaded ? '#1a5f3e' : '#0f3460',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: isActive ? '2px solid #fff' : '2px solid transparent',
                                    }}
                                >
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                        区間 {seg.id}
                                    </div>
                                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{seg.name}</div>
                                    <div style={{ fontSize: '10px', marginTop: '4px' }}>
                                        {isLoaded ? '✓ ロード済み' : '○ 未ロード'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* フリーモード時の説明 */}
            {mode === 'free' && (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
                        キーボードとマウスで自由に移動
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <div>W/A/S/D: 前後左右に移動</div>
                        <div>Q/E: 上下移動</div>
                        <div>Shift: 高速移動モード</div>
                        <div>マウス: 視点の回転</div>
                    </div>
                    <div style={{ marginTop: '15px', fontSize: '13px', color: '#00d4ff' }}>
                        💡 画面をクリックしてマウスをロック<br />
                        ESCキーで解除
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlPanel;