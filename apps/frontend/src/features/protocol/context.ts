import { createContext, useContext } from "react";

// Context to share current section content for ToC
interface ProtocolContextValue {
  currentContent: string;
  setCurrentContent: (content: string) => void;
}

export const ProtocolContext = createContext<ProtocolContextValue>({
  currentContent: "",
  setCurrentContent: () => {},
});

export const useProtocolContext = () => useContext(ProtocolContext);
