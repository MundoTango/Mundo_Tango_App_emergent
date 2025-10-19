import { createContext, useContext, useState, ReactNode } from "react";

interface PageAgentContextType {
  currentPageAgent: string | null;
  setCurrentPageAgent: (agent: string | null) => void;
  agentResponse: string | null;
  setAgentResponse: (response: string | null) => void;
}

export const PageAgentContext = createContext<PageAgentContextType | undefined>(undefined);

export function PageAgentProvider({ children }: { children: ReactNode }) {
  const [currentPageAgent, setCurrentPageAgent] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  return (
    <PageAgentContext.Provider
      value={{
        currentPageAgent,
        setCurrentPageAgent,
        agentResponse,
        setAgentResponse,
      }}
    >
      {children}
    </PageAgentContext.Provider>
  );
}

export function usePageAgentContext() {
  const context = useContext(PageAgentContext);
  if (context === undefined) {
    throw new Error("usePageAgentContext must be used within a PageAgentProvider");
  }
  return context;
}
