import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const userStore = create(
    devtools((set,get)=>({
        info:{
            fullname:"User",
            username:"@User",
            profileimage:"/defaultProfile.png",
            savedgames:[],
            badge:[],
            settings:{},
            theme:[],
            wincount:[],
            loosecount:[]
        },
    }))
);