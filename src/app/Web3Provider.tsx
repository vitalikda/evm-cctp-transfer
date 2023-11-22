"use client";

import { initializeConnector, Web3ReactProvider } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

const MetaMaskConnector = initializeConnector(
  (actions) => new MetaMask({ actions }),
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Web3ReactProvider connectors={[MetaMaskConnector]}>
      {children}
    </Web3ReactProvider>
  );
};
