"use client";
import React, { useState, useEffect, useContext } from "react";
import { StationContext } from "./station";
import IcecastMetadataStats from "icecast-metadata-stats";

const DEFUALT_TRACK = {
  stationId: null,
  trackId: null,
  artistId: null,
  StreamTitle: "",
  trackName: "",
  artistName: "",
  artworkURL: "/track-bg-default.webp",
  artistImage: "/artist-bg-default.webp",
  trackViewUrl: "#",
  loaded: false,
  processed: false,
  metaDataFound: false,
};

// Create a context for Player authentication and session information
export const PlayerContext = React.createContext();

// Player provider component to manage Player authentication and session
export const PlayerProvider = ({ children }) => {
  const { station, currentPlaying, addTrack } = useContext(StationContext);
  const [player, setPlayer] = useState({
    play: () => {},
    stop: () => {},
    setVolume: () => {},
    switchEndpoint: () => {},
  });
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [playerIsLoaded, setPlayerIsLoaded] = useState(false);
  const [playerState, setPlayerState] = useState("stopped");
  const [playerVolume, setPlayerVolume] = useState(1);
  const [currentTrack, setCurrentTrack] = useState(DEFUALT_TRACK);
  const [statsInterval, setStatsInterval] = useState(null);
  const [initalTrackLoaded, setInitalTrackLoaded] = useState(false);

  const changeVolume = (volume) => {
    setPlayerVolume(volume);
    player.setVolume(volume);
  };

  useEffect(() => {
    if (currentPlaying.title && !initalTrackLoaded) {
      console.log("Current Playing", currentPlaying);
      setInitalTrackLoaded(true);
      setCurrentTrack({
        ...DEFUALT_TRACK,
        StreamTitle: currentPlaying.title,
        stationId: currentPlaying.stationId,
        artworkURL: currentPlaying.artworkURL || DEFUALT_TRACK.artworkURL,
        trackName: currentPlaying.trackName,
        artistName: currentPlaying.artistName,
        artistImage: currentPlaying?.artistImage || DEFUALT_TRACK.artistImage,
        loaded: true,
        processed: false,
        metaDataFound: true,
      });
    }
  }, [currentPlaying, initalTrackLoaded]);

  useEffect(() => {
    if (station && !playerInitialized) {
      console.log("Player initialized", station.url);
      setPlayerInitialized(true);
      async function initializePlayer() {
        const { default: IcecastMetadataPlayer } = await import(
          "icecast-metadata-player"
        );

        let options = {
          lastPlayedMetadata: true,
          metadataTypes: ["icy", "ogg"],
          onMetadata: (metadata) => {
            setCurrentTrack((prevState) => {
              if (metadata.StreamTitle === prevState.StreamTitle) {
                return prevState;
              }
              return {
                ...DEFUALT_TRACK,
                StreamTitle: metadata.StreamTitle,
                stationId: station.id,
                artworkURL: station.thumbnail,
              };
            });
          },
          onError: (error) => {
            console.error("ERROR", error);
          },
        };

        const iceCastPlayer = new IcecastMetadataPlayer(station.url, {
          ...options,
        });

        setPlayer({
          play: async () => {
            setPlayerState("loading");
            await iceCastPlayer.play();
            setPlayerState("playing");
          },
          stop: async () => {
            await iceCastPlayer.stop();
            setPlayerState("stopped");
          },
          setVolume: (volume) => {
            iceCastPlayer.audioElement.volume = volume;
          },
          switchEndpoint: async () => {
            await iceCastPlayer.stop();
            await iceCastPlayer.detachAudioElement();
            setPlayerInitialized(false);
            setPlayerIsLoaded(true);
            setPlayerState("stopped");
          },
        });
        if (playerIsLoaded) {
          setPlayerState("loading");
          await iceCastPlayer.play();
          iceCastPlayer.audioElement.volume = playerVolume;
          setPlayerState("playing");
        }
      }

      initializePlayer();
    }
  }, [station, playerInitialized, playerVolume, playerIsLoaded]);

  useEffect(() => {
    if (currentTrack.stationId !== null && !currentTrack.loaded) {
      async function fetchMetadata() {
        await getAdditionalMetadata(currentTrack);
      }
      fetchMetadata();
    }
  }, [currentTrack]);

  useEffect(() => {
    if (currentTrack.processed) {
      console.log("Current Track", currentTrack);
      addTrack(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (station) {
      if (playerState == "playing") {
        if (statsInterval) {
          clearInterval(statsInterval);
          setStatsInterval(null);
          console.log("Stats loader cleared");
        }
      } else {
        if (statsInterval) {
          return;
        }
        const fetchStats = async () => {
          try {
            const statsListener = new IcecastMetadataStats(station.url, {
              onStats: async (stats) => {
                if (stats && stats.icy && stats.icy.StreamTitle) {
                  setCurrentTrack((prevState) => {
                    if (
                      stats.icy.StreamTitle === prevState.StreamTitle ||
                      (prevState.stationId !== station.id &&
                        prevState.stationId !== null)
                    ) {
                      return prevState;
                    }
                    return {
                      ...DEFUALT_TRACK,
                      StreamTitle: stats.icy.StreamTitle,
                      stationId: station.id,
                      artworkURL: station.thumbnail,
                    };
                  });
                }
                statsListener.stop();
              },
              onError: (error) => {
                console.error("Error fetching stats:", error);
              },
              interval: 5,
              sources: ["icy", "ogg"],
            });
            statsListener.start();
          } catch (error) {
            console.error("Error fetching stations:", error);
          }
        };
        fetchStats();
        let interval = setInterval(async () => {
          fetchStats();
        }, 5000);
        console.log("Stats loader Initialized");
        setStatsInterval(interval);
      }
    }
  }, [station, playerState, statsInterval]);

  const getAdditionalMetadata = async (track) => {
    console.log("Fetching metadata:", track.StreamTitle);
    setCurrentTrack((prevState) => ({
      ...prevState,
      loaded: true,
    }));
    if (track.StreamTitle) {
      const searchText = track.StreamTitle;
      const encodedSearchText = encodeURIComponent(searchText);
      const iTunesSearchURL = `/itunes-api/search?term=${encodedSearchText}&limit=1`;
      const response = await fetch(iTunesSearchURL);
      const json = await response.json();
      const trackData = json.results[0];

      if (trackData) {
        let artworkURL = trackData.artworkUrl100;
        artworkURL = artworkURL.replace("100x100", "600x600");
        const trackId = trackData.trackId;
        const artistId = trackData.artistId;
        const trackName = trackData.trackName;
        const artistName = trackData.artistName;
        const trackViewUrl = trackData.trackViewUrl;

        setCurrentTrack((prevState) => ({
          ...prevState,
          trackId,
          artistId,
          artworkURL,
          trackName,
          artistName,
          trackViewUrl,
          metaDataFound: true,
        }));

        let artistViewUrl = trackData.artistViewUrl;
        let artistImage = DEFUALT_TRACK.artistImage;

        if (artistViewUrl) {
          try {
            let searchedArtistImage = null;

            const response = await fetch("/api/artist", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                artistId: trackData.artistId,
                url: artistViewUrl,
              }),
            });
            const data = await response.json();

            if (response.ok) {
              searchedArtistImage = data.artistImage;
              artistImage = searchedArtistImage;
            } else {
              // Fallback to fetch artist image from Apple Music
              try {
                const response = await fetch(
                  artistViewUrl.replace(
                    "https://music.apple.com/us/artist/",
                    "/apple-music/"
                  )
                );
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const artistImageElement = doc.querySelector(
                  "main picture source"
                );
                if (artistImageElement) {
                  artistImage = artistImageElement
                    .getAttribute("srcset")
                    .split(" ")[0]
                    .replace(/\d{1,4}x\d{1,4}/, "1280x1280");
                }
              } catch (error) {
                console.log("There was a problem fetching the data:", error);
              }
            }
          } catch (error) {
            console.error("There was a problem fetching the data:", error);
          }
        }

        setCurrentTrack((prevState) => ({
          ...prevState,
          artistImage,
          processed: true,
        }));
      } else {
        const metaArray = track.StreamTitle.split(" - ");
        setCurrentTrack((prevState) => ({
          ...prevState,
          artistId: null,
          trackId: null,
          trackName: metaArray.length > 1 ? metaArray[1] : track.StreamTitle,
          artistName: metaArray.length > 0 ? metaArray[0] : "",
          processed: true,
          metaDataFound: false,
        }));
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        playerState,
        playerVolume,
        setPlayerIsLoaded,
        changeVolume,
        currentTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
