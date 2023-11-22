import { type Bytes, id, defaultAbiCoder } from "ethers/lib/utils";
import type { Log } from "@ethersproject/providers";

/**
 * Returns the abbreviation of an address
 * @param address the address to be convert to abbreviation
 */
export function getAddressAbbreviation(address: string): string {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

/**
 * Returns bytes32 from an address
 * @param address the address to be convert to bytes32
 */
export const addressToBytes32 = (address: string) => {
  // "0x" + 24 zeros + Rest of the address string with leading "0x" trimmed
  return (
    address.slice(0, 2) + "0".repeat(24) + address.slice(2, address.length)
  );
};

/**
 * Returns message bytes from decoding the event logs
 * @param logs the event logs of a transaction
 * @param topic the topic to be filter from the log
 */
export const getMessageBytesFromEventLogs = (logs: Log[], topic: string) => {
  const eventTopic = id(topic);
  const log = logs.find((l) => l.topics[0] === eventTopic);
  return defaultAbiCoder.decode(["bytes"], log!.data)[0] as Bytes;
};
