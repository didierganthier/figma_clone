import CursorSVG from '@/public/assets/CursorSVG'
import { CursorChatProps, CursorMode } from '@/types/type'
import React, { useEffect } from 'react'



const CursorChat = ({ cursor, cursorState, setCursorState, updateMyPresence }: CursorChatProps) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateMyPresence({ message: event.target.value });
        setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: event.target.value,
        })
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setCursorState({
                mode: CursorMode.Chat,
                previousMessage: '',
                message: '',

            })
        } else if (event.key === 'Escape') {
            setCursorState({
                mode: CursorMode.Hidden,
            })
        }
    }

    useEffect(() => {
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: '',
                });
            } else if (event.key === 'Escape') {
                updateMyPresence({ message: '' });
                setCursorState({
                    mode: CursorMode.Hidden,
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


    return (
        <div className='absolute top-0 left-0' style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)` }}>
            {cursorState.mode === CursorMode.Chat && (
                <>
                    <CursorSVG color='#000' />
                    <div className='absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]'>
                        {cursorState.previousMessage && (
                            <div className='mb-2'>{cursorState.previousMessage}</div>
                        )}
                        <input
                            title='Type a message'
                            className='z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none'
                            autoFocus={true}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder={cursorState.previousMessage ? '' : 'Type a message'}
                            value={cursorState.message}
                            maxLength={50}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

export default CursorChat