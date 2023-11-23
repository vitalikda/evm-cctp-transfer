"use client";

import { useWeb3React } from "@web3-react/core";
import { type Bytes, keccak256, parseUnits } from "ethers/lib/utils";
import { useState } from "react";
import { getChain } from "~/constants/chains";
import { DEFAULT_DECIMALS } from "~/constants/tokens";
import {
  Erc20__factory,
  MessageTransmitter__factory,
  TokenMessenger__factory,
} from "~/typechain";
import { getAttestation } from "~/utils/attestation";
import { addressToBytes32, getMessageBytesFromEventLogs } from "~/utils/eth";
import { delay, pollFunction } from "~/utils/polling";

type Transaction = {
  destinationChainId: number;
  message: Bytes;
  attestation: string;
};

const Send = ({ onSuccess }: { onSuccess: (tx: Transaction) => void }) => {
  const { provider, account, chainId } = useWeb3React();

  const handelSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = new FormData(event.currentTarget);
    const amount = values.get("amount")?.toString();
    const address = values.get("address")?.toString();

    try {
      if (!amount || !address) throw new Error("Not valid form data");
      if (!provider) throw new Error("No provider");
      if (!account) throw new Error("No account");
      if (!chainId) throw new Error("No chainId");

      const chain = getChain(chainId);
      if (!chain) throw new Error("Not supported chain");

      const { usdcContractAddress, tokenMessenger } = chain;
      const signer = provider.getSigner();
      const amountBN = parseUnits(amount, DEFAULT_DECIMALS);
      const destinationDomain = 2; // TODO: handle target chain

      // STEP 1: Approve messenger contract to withdraw from our active eth address
      const token = Erc20__factory.connect(usdcContractAddress, signer);
      const approveRes = await token.approve(tokenMessenger, amountBN);
      const approveTx = approveRes.hash;
      console.log("approveTx", approveTx);

      const approveReceipt = await pollFunction(
        () => provider.getTransactionReceipt(approveTx),
        (receipt) => receipt?.status === 1,
      );
      if (!approveReceipt) throw new Error("Approve transaction failed");

      // STEP 2: Burn USDC
      const contract = TokenMessenger__factory.connect(tokenMessenger, signer);
      const burnResponse = await contract.depositForBurn(
        amountBN,
        destinationDomain,
        addressToBytes32(address),
        usdcContractAddress,
      );
      const burnTx = burnResponse.hash;
      console.log("burnTx", burnTx);

      const burnReceipt = await pollFunction(
        () => provider.getTransactionReceipt(burnTx),
        (receipt) => receipt?.status === 1,
      );
      if (!burnReceipt) throw new Error("Burn transaction failed");

      // STEP 3: Retrieve message bytes from logs
      const messageBytes = getMessageBytesFromEventLogs(
        burnReceipt.logs,
        "MessageSent(bytes)",
      );
      console.log("messageBytes", messageBytes);
      const messageHash = keccak256(messageBytes);
      console.log("messageHash", messageHash);

      // STEP 4: Fetch attestation signature
      const attestation = await pollFunction(
        () => getAttestation(messageHash),
        (result) => !!result?.attestation && result?.status === "complete",
        10000,
        20,
      );
      if (!attestation) throw new Error("Attestation failed");

      onSuccess({
        destinationChainId: 420, // TODO: handle target chain,
        message: messageBytes,
        attestation: attestation.attestation,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handelSubmit} className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div>
          <label htmlFor="address" className="mb-2 block text-sm text-gray-200">
            Destination Address
          </label>
          <input
            name="address"
            type="text"
            className="focus:shadow-outline w-full appearance-none rounded border px-2 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="amount" className="mb-2 block text-sm text-gray-200">
            Amount
          </label>
          <input
            name="amount"
            type="text"
            className="focus:shadow-outline w-full appearance-none rounded border px-2 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
};

const Receive = ({ tx }: { tx: Transaction }) => {
  const { connector, provider, chainId } = useWeb3React();

  const handleChangeChain = async () => {
    await connector.activate(tx.destinationChainId)?.catch((error) => {
      console.log(error);
      return;
    });
    await delay(3000); // Safety delay to allow for Web3 context to update
  };

  const handleReceive = async () => {
    try {
      if (!provider) throw new Error("No provider");

      const chain = getChain(tx.destinationChainId);
      if (!chain) throw new Error("Not supported chain");

      const { messageTransmitter } = chain;
      // STEP 5: Using the message bytes and signature receive the funds on destination chain and address
      const signer = provider.getSigner();
      const messenger = MessageTransmitter__factory.connect(
        messageTransmitter,
        signer,
      );
      const receiveResponse = await messenger.receiveMessage(
        tx.message,
        tx.attestation,
      );
      const receiveTx = receiveResponse.hash;
      console.log("receiveTx", receiveTx);

      const receiveReceipt = await pollFunction(
        () => provider.getTransactionReceipt(receiveTx),
        (receipt) => receipt?.status === 1,
      );
      if (!receiveReceipt) throw new Error("Receive transaction failed");

      alert("Success");
    } catch (error) {
      console.error(error);
    }
  };

  if (!chainId) return null;

  return (
    <div>
      {chainId !== tx.destinationChainId ? (
        <button
          onClick={handleChangeChain}
          className="focus:shadow-outline w-fit rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Switch Chain
        </button>
      ) : (
        <button
          onClick={handleReceive}
          className="focus:shadow-outline w-fit rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Receive
        </button>
      )}
    </div>
  );
};

export const SendForm = () => {
  const [transaction, setTransaction] = useState<Transaction>();

  const { isActive } = useWeb3React();

  if (!isActive) return null;

  return (
    <>
      {!transaction ? (
        <Send onSuccess={(tx) => setTransaction(tx)} />
      ) : (
        <Receive tx={transaction} />
      )}
    </>
  );
};
