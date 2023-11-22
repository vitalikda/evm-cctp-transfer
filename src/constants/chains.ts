export type Chain = (typeof TESTNET_CHAINS)[keyof typeof TESTNET_CHAINS];

export const TESTNET_CHAINS = {
  5: {
    urls: [
      "https://eth-goerli.g.alchemy.com/v2/0ay-8v2z-6NolIKMVBAy3qfFZEGbhEfU",
    ],
    name: "Ethereum Goerli",
    nativeCurrency: {
      name: "Goerli ETH",
      symbol: "gorETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://goerli.etherscan.io"],
    cctpDomain: 0,
    usdcContractAddress: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    tokenMessenger: "0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8",
    messageTransmitter: "0x26413e8157cd32011e726065a5462e97dd4d03d9",
    tokenMinter: "0xca6b4c00831ffb77afe22e734a6101b268b7fcbe",
  },
  420: {
    urls: [
      "https://opt-goerli.g.alchemy.com/v2/tpycglMmFE8LwqgKeObex2Uu1wrbL32x",
    ],
    name: "Optimism Goerli",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://goerli-explorer.optimism.io"],
    cctpDomain: 2,
    usdcContractAddress: "0xC108c33731a62781579A28F33b0Ce6AF28a090D2",
    tokenMessenger: "0x23a04d5935ed8bc8e3eb78db3541f0abfb001c6e",
    messageTransmitter: "0x9ff9a4da6f2157a9c82ce756f8fd7e0d75be8895",
    tokenMinter: "0x162580c71df51638df454e9ad75f11d184ff867b",
  },
  43113: {
    urls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    name: "Avalanche FUJI C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.snowtrace.io/"],
    cctpDomain: 1,
    usdcContractAddress: "0x5425890298aed601595a70AB815c96711a31Bc65",
    tokenMessenger: "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0",
    messageTransmitter: "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79",
    tokenMinter: "0x4ed8867f9947a5fe140c9dc1c6f207f3489f501e",
  },
};

export const getChain = (chainId: number) => {
  return Object.entries(TESTNET_CHAINS).find(
    ([key]) => Number(key) === chainId,
  )?.[1];
};
