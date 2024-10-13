// frontend/src/hooks/useTypewriterEffect.js

import { useState, useEffect } from 'react';

const useTypewriterEffect = (text, initialSpeed = 30) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        let isCancelled = false;

        const type = () => {
            if (isCancelled) return;
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;

                // テキストの長さに応じて速度を調整
                let speed = initialSpeed;
                if (text.length > 1000) {
                    speed = initialSpeed / 2;
                } else if (text.length > 2000) {
                    speed = initialSpeed / 4;
                }

                setTimeout(type, speed);
            }
        };

        type();

        return () => {
            isCancelled = true;
        };
    }, [text, initialSpeed]);

    return displayedText;
};

export default useTypewriterEffect;
