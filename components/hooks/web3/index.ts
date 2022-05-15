import { useHooks } from "@providers/web3";

export const useAccount = () => {
  const hooks = useHooks();
  return {
    account: hooks.useAccount(),
  };
};
