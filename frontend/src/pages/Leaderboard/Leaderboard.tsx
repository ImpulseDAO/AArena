import { FC, useCallback, useEffect, useMemo, useState } from "react";
import "./styles.scss";
import { TableUI } from "components/Table";
import { TableColumnsType } from "components/Table/types";
import AvatarIcon from "../../assets/images/avatar.png";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadWasmState } from "@gear-js/react-hooks";
import { useWasmMetadata } from "pages/Queue";
import { ARENA_ID } from "pages/StartFight/constants";
import arenaMetaWasm from "../../assets/arena_state.meta.wasm";

export type LeaderboardProps = {};

const inProgressColumns: TableColumnsType[] = [
  {
    field: "ownerId",
    headerName: "Owner Id",
    width: 605,
    position: "center",
  },
  {
    field: "nw",
    headerName: "number of wins",
    width: 160,
    position: "center",
  },
];

export const Leaderboard = () => {
  const navigate = useNavigate();
  const { account } = useAccount();
  const { buffer } = useWasmMetadata(arenaMetaWasm);

  const leaderBoard = useReadWasmState(
    ARENA_ID,
    buffer,
    "leaderboard",
    account?.decodedAddress
  ).state;

  const inProgressRows = useMemo(() => {
    if (leaderBoard) {
      return Object.keys(leaderBoard)
        .map((key) => ({
          ownerId: key,
          nw: leaderBoard[key],
        }))
        .sort((row1, row2) => Number(row2.nw) - Number(row1.nw));
    }

    return [];
  }, [leaderBoard]);

  const handleClickCell = useCallback(
    (arg) => {
      navigate(`/profile/${arg.ownerId}`);
    },
    [navigate]
  );

  // console.log("leaderBoard", users);

  return (
    <div className="leaderboard">
      <div className="modal_leaderboard">
        <div className="header">Leaderboard</div>
        <div className={"scroll_container"}>
          <div className="modal_table">
            <TableUI
              rows={inProgressRows}
              columns={inProgressColumns}
              cellClick={handleClickCell}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
