import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ARENA_ID, METADATA } from "../constants";
import { useAccount, useSendMessage } from "@gear-js/react-hooks";
import { ProgramMetadata } from "@gear-js/api";

export const useOnSubmit = (): VoidFunction => {
  const navigate = useNavigate();
  const { account } = useAccount();

  const meta = useMemo(() => ProgramMetadata.from(METADATA), []);
  const send = useSendMessage(ARENA_ID, meta, { isMaxGasLimit: true });

  return useCallback(() => {
    navigate("/tournament");
    send(
      {
        Register: {
          owner_id: account.decodedAddress,
        },
      },
      {
        onSuccess: () => {
          console.log("success");
        },
        onError: () => {
          console.log("error");
        },
      }
    );
  }, [account?.decodedAddress, navigate, send]);
};
