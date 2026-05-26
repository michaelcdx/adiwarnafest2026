import { createContext, useContext, useState } from "react";

export interface LiveScore {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  quarter: string;
  timer: string;
  sport: string;
  isLive: boolean;
}

const defaultLiveScore: LiveScore = {
  team1: "Tigers VC",
  team2: "Phoenix",
  score1: 84,
  score2: 79,
  quarter: "Quarter 4",
  timer: "04:22",
  sport: "Basketball 5x5",
  isLive: true,
};

interface LiveScoreContextValue {
  liveScore: LiveScore;
  setLiveScore: (score: LiveScore) => void;
}

const LiveScoreContext = createContext<LiveScoreContextValue>({
  liveScore: defaultLiveScore,
  setLiveScore: () => {},
});

export const LiveScoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [liveScore, setLiveScore] = useState<LiveScore>(defaultLiveScore);
  return (
    <LiveScoreContext.Provider value={{ liveScore, setLiveScore }}>
      {children}
    </LiveScoreContext.Provider>
  );
};

export const useLiveScore = () => useContext(LiveScoreContext);
