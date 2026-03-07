import { createContext, useState } from 'react'

const AudioContext = createContext({
    sound: true,
    music: true,
    toggleSound: () => {},
    toggleMusic: () => {}
});

const AudioProvider = (props) => {
    const [sound, setSound] = useState(false);
    const [music, setMusic] = useState(false);

    // Custom toggle functions
    const toggleSound = () => setSound(prev => !prev);
    const toggleMusic = () => setMusic(prev => !prev);
    
    return (
        <AudioContext.Provider value={{ sound, music, toggleSound, toggleMusic }}>
            {props.children}
        </AudioContext.Provider>
    );
}

export { AudioContext, AudioProvider }