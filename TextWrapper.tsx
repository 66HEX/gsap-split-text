import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';

interface TextWrapperProps {
    children: ReactNode;
    className?: string;
}

const SplitTextWrapper: React.FC<TextWrapperProps> = ({ children, className }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const uniqueId = useRef(Math.random().toString(36).substr(2, 9));
    const [letters, setLetters] = useState<{ letter: string; classes: string }[]>([]);

    const splitText = (child: ReactNode, inheritedClasses = ''): { letter: string; classes: string }[] => {
        if (typeof child === 'string') {
            return child.split('').map(letter => ({ letter, classes: inheritedClasses }));
        } else if (React.isValidElement(child)) {
            const childClasses = `${inheritedClasses} ${child.props.className || ''}`.trim();
            return React.Children.toArray(child.props.children).flatMap(nestedChild => splitText(nestedChild, childClasses));
        }
        return [];
    };

    useEffect(() => {
        const splitLetters = React.Children.toArray(children).flatMap(child => splitText(child));
        setLetters(splitLetters);
    }, [children]);

    useEffect(() => {
        const timeline = gsap.timeline({ paused: true });

        letters.forEach((_, index) => {
            timeline
                .to(`.letter-${uniqueId.current}-${index}`, {
                    y: '-100%',
                    duration: 0.3,
                    ease: 'power2.inOut',
                    delay: index * 0.01,
                }, 0)
                .fromTo(`.letter-${uniqueId.current}-${index + letters.length}`,
                    { y: '100%', opacity: 0 },
                    { y: '0%', opacity: 1, duration: 0.3, ease: 'power2.inOut', delay: index * 0.01 }, '<');
        });

        const wrapper = wrapperRef.current;

        const handleMouseEnter = () => {
            timeline.play();
        };

        const handleMouseLeave = () => {
            timeline.reverse();
        };

        if (wrapper) {
            wrapper.addEventListener('mouseenter', handleMouseEnter);
            wrapper.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (wrapper) {
                wrapper.removeEventListener('mouseenter', handleMouseEnter);
                wrapper.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [letters]);

    return (
        <div
            ref={wrapperRef}
            className={`relative overflow-hidden inline-block cursor-pointer ${className}`}
        >
            {letters.map((item, index) => (
                <div key={index} className={`inline-block text-center letter-${uniqueId.current}-${index} ${item.classes}`}>
                    {item.letter}
                </div>
            ))}
            <div className="absolute top-0 left-0">
                {letters.map((item, index) => (
                    <div
                        key={index + letters.length}
                        className={`inline-block text-center letter-${uniqueId.current}-${index + letters.length} ${item.classes} opacity-0`}
                        style={{ transform: 'translateY(100%)' }}
                    >
                        {item.letter}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SplitTextWrapper;
