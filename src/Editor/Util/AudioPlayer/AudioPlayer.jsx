/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useRef, useEffect } from 'react';

import WickInput from 'Editor/Util/WickInput/WickInput';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import ClipLoader from "react-spinners/ClipLoader";

import './_audioplayer.scss';

export const AudioPlayer = ({src, loadSrc}) => {
    const [currentT, setCurrentT] = useState(0);
    const [paused, setPaused] = useState(true);

    const [canPlay, setCanPlay] = useState(false);

    const [loading, setLoading] = useState(!!src);

    const audioRef = useRef(null);

    function togglePlaying() {
        if (canPlay) {
            if (paused) {
                audioRef.current.currentTime = currentT * audioRef.current.duration;
                audioRef.current.play();
                setPaused(false);
            }
            else {
                audioRef.current.pause();
                setCurrentT(audioRef.current.currentTime / audioRef.current.duration);
                setPaused(true);
            }
        }
        else if (paused && !loading) {
            setPaused(false);
            setLoading(true);
            loadSrc();
        }
    }

    // Update currentTime while playing
    useEffect(
        () => {
            let interval = null;
            if (!paused && canPlay) {
                interval = setInterval(() => {
                    setCurrentT(audioRef.current.currentTime / audioRef.current.duration);
                }, 100);
            }
            return () => clearInterval(interval);
        }
    );

    function seconds_to_string(t) {
        let d = Math.trunc((t % 1) * 10);
        let s = Math.trunc(t) % 60;
        let m = Math.floor(t / 60);
        return m + ":" + ('0' + s).slice(-2) + "." + d;
    }

    function get_time_string() {
        let t = seconds_to_string(canPlay ? audioRef.current.currentTime : 0);
        let d = seconds_to_string(canPlay ? audioRef.current.duration : 0);
        return t + " / " + d;
    }

    return (
        <div className="audio-player-container">
            {src &&
            <audio
                ref={audioRef}
                src={src}
                onCanPlay={() => {
                    setCanPlay(true);
                    setLoading(false);
                    if (!paused) {
                        audioRef.current.play();
                    }
                }}
                onEnded={() => {
                    setCurrentT(1);
                    setPaused(true);
                }}
            />
            }
            <span className="playbutton">
                {loading ? 
                <ClipLoader
                color={"#ffffff"}
                loading={loading}
                />
                :
                <ActionButton 
                    action={togglePlaying}
                    color="gray"
                    icon={paused ? "play" : "pause"}/>
                }
                
            </span>
            <span className="controls">
                <div className="info-text">{get_time_string()}</div>
                <div className="control">
                    <WickInput
                    type="slider"
                    containerclassname="time-slider-container"
                    className="time-slider"
                    aria-label="audio control slider"
                    onChange={(t) => {
                        setCurrentT(t);
                        if (canPlay) {
                            audioRef.current.currentTime = t * audioRef.current.duration;
                        }
                    }}
                    value={currentT}
                    min={0}
                    max={1}
                    step={0.01}
                    />
                </div>
            </span>
        </div>
    );
}

export default AudioPlayer