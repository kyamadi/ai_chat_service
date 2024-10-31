// frontend/src/hooks/useTypewriterEffect.js

import { useState, useEffect } from 'react';

const useTypewriterEffect = (text, speed, isActive) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!isActive) {
            setDisplayedText(text);
            return;
        }

        let currentIndex = 0;
        let isCancelled = false;

        const type = () => {
            if (isCancelled) return;
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;

                // テキストの長さに応じて速度を調整
                let currentSpeed = speed;
                if (text.length > 1000) {
                    currentSpeed = speed / 6;
                } else if (text.length > 2000) {
                    currentSpeed = speed / 6;
                }

                setTimeout(type, currentSpeed);
            }
        };

        type();

        return () => {
            isCancelled = true;
        };
    }, [text, speed, isActive]);

    return displayedText;
};

export default useTypewriterEffect;
