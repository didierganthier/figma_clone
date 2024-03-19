import React, { useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useCallback } from 'react'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    })

    const [reaction, setReaction] = useState<Reaction[]>([]);

    const broadcast = useBroadcastEvent();

    useInterval(() => {
        setReaction((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
    }, 1000);

    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            setReaction((reactions) => reactions.concat([
                {
                    point: { x: cursor.x, y: cursor.y },
                    value: cursorState.reaction,
                    timestamp: Date.now(),
                }
            ]));

            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100);

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;

        setReaction((reactions) => reactions.concat([
            {
                point: { x: event.x, y: event.y },
                value: event.value,
                timestamp: Date.now(),
            }
        ]));
    });

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if (cursorState == null || cursorState.mode !== CursorMode.ReactionSelector) {

            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({ cursor: { x, y } });
        }
    }, []);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden });

        updateMyPresence({ cursor: null, message: null });
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } });

        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ?
                { ...state, isPressed: true } : state
        );

    }, [cursorState.mode, setCursorState]);

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ?
                { ...state, isPressed: true } : state
        );

    }, [cursorState.mode, setCursorState]);

    useEffect(() => {
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: '',
                    message: '',
                });
            } else if (event.key === 'Escape') {
                updateMyPresence({ message: '' });
                setCursorState({
                    mode: CursorMode.Hidden,
                });
            } else if (event.key === 'e') {
                setCursorState({
                    mode: CursorMode.ReactionSelector,
                });
            }
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === '/') {
                event.preventDefault();
            }
        }

        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        }

    }, [updateMyPresence, setCursorState]);

    const setReactions = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center text-center border-2 border-green-500"
        >
            <canvas />

            {reaction.map((reaction, index) => (
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))}

            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}

            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={setReactions}
                />
            )}


            <LiveCursors others={others} />
        </div>
    )
}

export default Live