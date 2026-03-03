import React, { useEffect, useState } from 'react'
import LudoOffline from '../components/offlineBoard/LudoOffline'
import gameActions from '@/store/gameLogic'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import GameSetup from '@/components/pageComponents/GameSetup'
import { useShallow } from 'zustand/shallow'
import useUserStore from '@/store/userStore'

const Session = () => {
  const { boardType } = useParams();
  const navigate = useNavigate();

  const [showBoard, setShowBoard] = useState(false);

  const userInfo = useUserStore(
    useShallow((state) => state.info)
  );

  // ✅ FIX: Side effects must be inside useEffect
  useEffect(() => {
    if ((boardType === "poi" || boardType === "pof") && !userInfo?.email) {
      toast.info("User registration required!");
      navigate("/options/signin");
    }
  }, [boardType, navigate]);

  return (
    <div className='bg-black h-screen w-screen flex items-center justify-center'>
      {showBoard ? (
        <LudoOffline />
      ) : (
        <GameSetup info={userInfo} />
      )}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Session;