import { useContext, useEffect, useState } from "react";
import { FaPlay, FaSpinner, FaStop } from "react-icons/fa6";
import VolumeControl from "./VolumeControl";
import Image from "next/image";
import { PlayerContext } from "@/context/player";

const PLAYER_ICONS = {
  PLAY: <FaPlay className="h-6 w-6" />,
  STOP: <FaStop className="h-6 w-6" />,
  SPINNER: <FaSpinner className="h-6 w-6 animate-spin" />,
};

const Player = () => {
  const { player, playerState, setPlayerIsLoaded, currentTrack } =
    useContext(PlayerContext);
  const [playerCurrentIcon, setPlayerCurrentIcon] = useState(PLAYER_ICONS.PLAY);

  useEffect(() => {
    if (playerState === "playing") {
      setPlayerCurrentIcon(PLAYER_ICONS.STOP);
    } else if (playerState === "stopped" || playerState === "ready") {
      setPlayerCurrentIcon(PLAYER_ICONS.PLAY);
    } else {
      setPlayerCurrentIcon(PLAYER_ICONS.SPINNER);
    }
  }, [playerState]);

  function togglePlayer() {
    if (playerState === "playing") {
      player.stop();
    } else {
      setPlayerIsLoaded(true);
      player.play();
    }
  }

  return (
    <section className="mx-4 rounded-4xl md:mx-8">
      <div className="relative flex min-h-[205px] items-end rounded-2xl bg-black/25 bg-cover bg-center bg-no-repeat p-4 drop-shadow-2xl sm:min-h-[400px] md:p-8 lg:min-h-[670px] lg:rounded-[35px]">
        <div className="flex w-full justify-between z-50">
          <a
            target="_blank"
            className="flex items-center gap-6"
            href={currentTrack.trackViewUrl}
          >
            <Image
              alt="Album thumbnail image"
              loading="lazy"
              width="150"
              height="150"
              className="hidden rounded-md shadow-md transition-all duration-200 hover:scale-105 lg:flex"
              src={currentTrack.artworkURL}
            />
            <div className="flex flex-col">
              <p className="break-words font-extrabold text-white drop-shadow-md truncate line-clamp-2 whitespace-normal md:mb-2 md:text-4xl md:leading-normal">
                {currentTrack.trackName}
              </p>
              <p className="break-words font-semibold text-white drop-shadow-md truncate line-clamp-2 whitespace-normal md:text-2xl md:leading-normal">
                {currentTrack.artistName}
              </p>
            </div>
          </a>
          <div className="hidden items-center gap-4 self-end lg:flex">
            <div className="container mx-auto undefined">
              <VolumeControl />
            </div>
            <div className="rounded-full bg-gradient-to-br from-[#cd3e5b] to-[#fbbf55] p-[4px]">
              <button
                type="button"
                className="rounded-full bg-white p-6 text-black shadow-xl transition-all duration-300 hover:scale-[1.07] md:p-10 undefined"
                aria-label="play music"
                onClick={() => {
                  togglePlayer();
                }}
              >
                {playerCurrentIcon}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 left-0 bottom-0 h-[50%] bg-gradient-to-b from-[transparent] to-[#000000ba] rounded-2xl lg:rounded-[35px]"></div>
        <div className="playerBGContainer absolute right-0 left-0 bottom-0 top-0 bg-gradient-to-b from-[transparent] to-[#000000ba] rounded-2xl lg:rounded-[35px] overflow-hidden">
          <Image
            alt="Album artist image"
            priority
            src={currentTrack.artistImage}
            fill
            sizes="100vw"
            onError={(e) => {
              e.target.src = "/artist-bg-default.webp";
            }}
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 lg:hidden">
        <div className="container mx-auto hidden justify-end md:flex">
          <VolumeControl />
        </div>
        <button
          type="button"
          className="rounded-full bg-white p-6 text-black shadow-xl transition-all duration-300 hover:scale-[1.07] md:p-10 z-20 -mt-8 mr-6 border-2 border-kl-primary bg-white"
          aria-label="play music"
          onClick={() => {
            togglePlayer();
          }}
        >
          {playerCurrentIcon}
        </button>
      </div>
    </section>
  );
};

export default Player;
