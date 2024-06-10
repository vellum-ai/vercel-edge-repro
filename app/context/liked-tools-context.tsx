import { type PropsWithChildren, createContext, useState } from "react";

export const LikedToolsContext = createContext<{
  likedTools: number[];
  likeTool: (toolID: number) => void;
  unlikeTool: (toolID: number) => void;
}>({
  likedTools: [],
  likeTool: () => {},
  unlikeTool: () => {},
});

export const LikedToolsProvider: React.FC<
  PropsWithChildren<{ initial: number[] }>
> = ({ children, initial }) => {
  const [likedTools, setLikedTools] = useState<number[]>(initial);

  const likeTool = (toolID: number) => {
    setLikedTools([...likedTools, toolID]);
  };

  const unlikeTool = (toolID: number) => {
    setLikedTools(likedTools.filter((id) => id !== toolID));
  };

  return (
    <LikedToolsContext.Provider value={{ likedTools, likeTool, unlikeTool }}>
      {children}
    </LikedToolsContext.Provider>
  );
};
