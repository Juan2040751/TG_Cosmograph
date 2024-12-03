import { CosmographTimeline, CosmographTimelineRef } from '@cosmograph/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from '../data';
import './styles.css';

const Timeline = ({ baseHueColor }: { baseHueColor: number }) => {
    const timeline = useRef<CosmographTimelineRef<Link>>();
    const [tooltip, setTooltip] = useState<{ visible: boolean; count: number | null; x: number; y: number }>({
        visible: false,
        count: null,
        x: 0,
        y: 0,
    });

    const showTooltip = (e: any) => {
        const target = e.target;
        const count = target.__data__?.count;
        if (count !== undefined) {
            //console.log({ target })
            target.onpointerleave = () => {
                console.log({ target })
                setTooltip({
                    visible: false,
                    count: null,
                    x: 0,
                    y: 0,
                })
            }
            const rect = target.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const x = (rect.x + rect.width < viewportWidth - 15) ? rect.x + rect.width / 2 : rect.x - rect.width - 8;
            setTooltip({
                visible: true,
                count,
                x,
                y: rect.y - rect.height - 60,
            });
        }
    };



    return (
        <>
            <CosmographTimeline
                className={'timelineStyle'}
                ref={timeline}
                accessor={(link: Link) => {
                    if (!link || !link.date || link.date.length === 0) {
                        return 0;
                    }
                    const mostRecentDate: Date = link.date.reduce((latest: Date, currentDate: string) => {
                        const current = new Date(currentDate);
                        return current > latest ? current : latest;
                    }, new Date(link.date[0]));
                    return mostRecentDate;
                }}
                style={{ '--cosmograph-timeline-bar-color': `hsl(${baseHueColor}, 100%, 50%)`, }}
                animationSpeed={20}
                barTopMargin={14}
                showAnimationControls
                onBarHover={showTooltip}

                barCount={100}

            />
            {tooltip.visible && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        background: '#333',
                        color: "#fff",
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        transform: 'translate(-50%, -100%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    {`Count: ${tooltip.count}`}
                </div>
            )}
        </>
    );
};

export default Timeline;
