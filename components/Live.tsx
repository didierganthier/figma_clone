import React, { useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useCallback } from 'react'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    })

    const [reaction, setReaction] = useState<Reaction[]>([]);

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
            <h1 className="text-4xl text-white">Liveblocks Figma Clone</h1>

            {/* {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )} */}

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