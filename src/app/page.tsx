import { ConnectWallet } from "~/app/ConnectWallet";
import { SendForm } from "~/app/SendForm";
import { Web3Provider } from "~/app/Web3Provider";

export default function HomePage() {
  return (
    <Web3Provider>
      <ConnectWallet />
      <SendForm />
    </Web3Provider>
  );
}
