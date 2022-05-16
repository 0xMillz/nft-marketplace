import useSWR from "swr";
import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import { EthereumEvent } from "@_types/ethereum";

type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
};
type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;
export type UseAccountHook = ReturnType<AccountHookFactory>;

export const hookFactory: AccountHookFactory =
  ({ provider, ethereum, isLoading }) =>
  () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
      provider ? "web3/useAccount" : null,
      async () => {
        const accounts = await provider!.listAccounts();
        return accounts[0];
      },
      {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }
    );

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        console.error("Please connect to a Web3 wallet");
      } else if (accounts[0] !== data) {
        mutate(accounts[0]);
      }
    };

    useEffect(() => {
      ethereum?.on(EthereumEvent.ACCOUNTS_CHANGED, handleAccountsChanged);
      return () => {
        ethereum?.removeListener(
          EthereumEvent.ACCOUNTS_CHANGED,
          handleAccountsChanged
        );
      };
    });

    const connect = async () => {
      try {
        ethereum?.request({ method: "eth_requestAccounts" });
      } catch (e) {
        console.error("ethereum.request() failure:", e);
      }
    };

    return {
      ...swr,
      connect,
      mutate,
      data,
      isLoading: isLoading as boolean,
      isInstalled: ethereum?.isMetaMask || false,
    };
  };

export const useAccount = hookFactory({});
