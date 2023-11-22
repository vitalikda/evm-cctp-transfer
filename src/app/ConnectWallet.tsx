"use client";

import { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { TESTNET_CHAINS, getChain } from "~/constants/chains";
import { getAddressAbbreviation } from "~/utils/eth";

const SelectWallet = () => {
  const { connector, chainId } = useWeb3React();

  const switchChain = async (desiredChainId: number) => {
    try {
      if (desiredChainId === chainId) return;
      await connector.activate(desiredChainId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <select
      value={chainId ?? "unknown"}
      onChange={(event) => {
        switchChain(Number(event.target.value));
      }}
      className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-2 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
    >
      <option hidden disabled value="unknown">
        Select chain
      </option>
      {Object.entries(TESTNET_CHAINS).map(([chainId, chain]) => (
        <option key={chainId} value={chainId}>
          {chain.name || chainId}
        </option>
      ))}
    </select>
  );
};

export const ConnectWallet = () => {
  const { connector, account, isActive, isActivating, chainId } =
    useWeb3React();

  useEffect(() => {
    connector.activate()?.catch(() => {
      console.debug("Failed to connect to network");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isActivating) {
    return <div>Connecting...</div>;
  }

  if (account && isActive) {
    return (
      <div className="flex items-center gap-4">
        <span className="mr-2">
          {(chainId && getChain(chainId)?.name) ?? "Unknown"}
        </span>
        <span className="mr-2">{getAddressAbbreviation(account)}</span>
        <button
          onClick={() => {
            if (connector.deactivate) {
              void connector.deactivate();
            } else {
              void connector.resetState();
            }
          }}
          className="focus:shadow-outline w-fit rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <SelectWallet />
      <button
        onClick={() => {
          void connector.activate();
        }}
        className="focus:shadow-outline w-fit rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Connect
      </button>
    </div>
  );
};
