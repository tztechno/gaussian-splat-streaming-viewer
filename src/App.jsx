import React, { useState, useEffect, useRef } from 'react';
import SplatViewer from './components/SplatViewer';
import ControlPanel from './components/ControlPanel';
import segmentsData from './data/segments.json';

const App = () => {
    const [mode, setMode] = useState('auto'); // 'auto' or 'free'
    const [currentPosition, setCurrentPosition] = useState(0);
    const [currentSegment, setCurrentSegment] = useState(0);
    const [loadedSegments, setLoadedSegments] = useState(new Set([0]));
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(20); // m/s
    const animationRef = useRef(null);

    const PRELOAD_DISTANCE = 50;
    const UNLOAD_THRESHOLD = 2; // 2セグメント前をアンロード

    // 現在位置からセグメントを判定
    const getSegmentAtPosition = (pos) => {
        return segmentsData.segments.find(seg => pos >= seg.start && pos < seg.end);
    };

    // セグメント管理ロジック
    useEffect(() => {
        const currentSeg = getSegmentAtPosition(currentPosition);
        if (!currentSeg) return;

        // セグメント変更検出
        if (currentSeg.id !== currentSegment) {
            setCurrentSegment(currentSeg.id);
            console.log(`[Segment Switch] ${currentSeg.name} (${currentSeg.id})`);
        }

        // 次のセグメントをプリロード
        const distanceToEnd = currentSeg.end - currentPosition;
        if (distanceToEnd < PRELOAD_DISTANCE && currentSeg.id < segmentsData.segments.length - 1) {
            const nextSegId = currentSeg.id + 1;
            if (!loadedSegments.has(nextSegId)) {
                console.log(`[Preload] Segment ${nextSegId}`);
                setLoadedSegments(prev => new Set([...prev, nextSegId]));
            }
        }

        // 古いセグメントをアンロード
        setLoadedSegments(prev => {
            const newSet = new Set(prev);
            prev.forEach(segId => {
                if (segId < currentSeg.id - UNLOAD_THRESHOLD) {
                    console.log(`[Unload] Segment ${segId}`);
                    newSet.delete(segId);
                }
            });
            return newSet;
        });
    }, [currentPosition, currentSegment]);

    // 自動モードのアニメーションループ
    useEffect(() => {
        if (mode === 'auto' && isPlaying) {
            const animate = () => {
                setCurrentPosition(prev => {
                    const next = prev + speed * 0.016; // 60fps
                    const maxPos = segmentsData.segments[segmentsData.segments.length - 1].end;
                    return next >= maxPos ? 0 : next;
                });
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mode, isPlaying, speed]);

    const handleSkip = (direction) => {
        const newSegment = Math.max(
            0,
            Math.min(segmentsData.segments.length - 1, currentSegment + direction)
        );
        setCurrentPosition(segmentsData.segments[newSegment].start + 10);
    };

    const handlePositionChange = (pos) => {
        setCurrentPosition(pos);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'free') {
            setIsPlaying(false); // フリーモードでは自動再生を停止
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SplatViewer
                currentPosition={currentPosition}
                currentSegment={currentSegment}
                loadedSegments={loadedSegments}
                segments={segmentsData.segments}
                mode={mode}
                onPositionChange={handlePositionChange}
            />
            <ControlPanel
                mode={mode}
                onModeChange={handleModeChange}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentPosition={currentPosition}
                currentSegment={currentSegment}
                loadedSegments={loadedSegments}
                segments={segmentsData.segments}
                speed={speed}
                setSpeed={setSpeed}
                onSkip={handleSkip}
                onPositionChange={handlePositionChange}
            />
        </div>
    );
};

export default App;