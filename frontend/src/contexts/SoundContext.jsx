import { createContext, useState } from 'react'

const AudioContext = createContext({
    sound: true,
    music: true,
    redirect: false,
    toggleSound: () => {},
    toggleMusic: () => {},
    allowRedirect: ()=>{}
});

const AudioProvider = (props) => {
    const [sound, setSound] = useState(false);
    const [music, setMusic] = useState(false);
    const [redirect,allowRedirect] = useState(false)

    // Custom toggle functions
    const toggleSound = () => setSound(prev => !prev);
    const toggleMusic = () => setMusic(prev => !prev);
    const allowSession = () => allowRedirect(pre => !pre);
    return (
        <AudioContext.Provider value={{ sound, music, redirect, toggleSound, toggleMusic, allowSession }}>
            {props.children}
        </AudioContext.Provider>
    );
}

export { AudioContext, AudioProvider }