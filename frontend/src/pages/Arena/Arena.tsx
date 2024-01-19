import { Title, Box, Grid, Image, Select, Stack, Badge, type TitleProps, Text, Flex } from "@mantine/core";
import ArenaPng from "assets/images/arena.png";
import { TheButton } from "components/TheButton";
import { Panel } from "components/Panel";
import { useCreateLobby, useLobbies } from "app/api/lobbies";
import { useNavigate } from "react-router-dom";
import { newRoutes } from "app/routes";
import { useMemo, useRef } from "react";
import { GasReserved } from "components/GasReserved/GasReserved";
import { useAlert } from "@gear-js/react-hooks";
import { PLAYERS_TO_RESERVATIONS_NEEDED_MAP } from "consts";

export const Arena = () => {
  const alert = useAlert();
  const navigate = useNavigate();
  const selectRef = useRef<HTMLInputElement | null>(null);

  const { data: lobbiesData, refetch: refetchLobbies } = useLobbies();

  const cards = useMemo(() => {
    if (!lobbiesData) return [];

    return [...lobbiesData?.lobbies].reverse().map(lobby => {
      return {
        tierText: 'tier' in lobby ? lobby.tier as string : "",
        lobbyId: lobby.id,
        playersSize: lobby.capacity,
        playersJoined: lobby.characters.length,
        gasNeeded: PLAYERS_TO_RESERVATIONS_NEEDED_MAP[lobby.capacity],
        gasReserved: lobby.reservationsCount,
        isFinished: lobby.battleLogs.length > 0,
      };
    });
  }, [lobbiesData]);

  /**
   * Get handleJoinLobby
   */
  const handleJoinLobby = ({ lobbyId }: {
    lobbyId: string;
  }) => {
    console.log('handleJoinLobby', lobbyId);

    navigate(newRoutes.lobby(lobbyId));
  };

  /**
   * 
   */

  const handleCreateLobby = useCreateLobby();

  return (
    <Flex style={{
      flex: 1,
      justifyContent: 'center',
    }} >
      <Grid m={'lg'} gutter={'md'}
        pb={150}
        style={{
          flex: 1,
          maxWidth: "min(1300px, 90%)",
        }}
      >
        <GridColumn >
          <Panel
            h={370}
            bg="black"
          >
            <Stack align="center" h="100%" gap={0}>
              <SwordsImage />

              <TitleText>Create a lobby</TitleText>

              <Stack w="100%" mt="auto" >
                <Select
                  ref={selectRef}
                  label="Choose number of players"
                  styles={{
                    input: {
                      height: 44,
                      fontSize: 16,
                    },
                    option: {
                      color: 'black',
                      fontSize: 14,
                    },
                    section: { pointerEvents: 'none' }
                  }}
                  labelProps={{
                    c: 'white',
                    fz: "sm",
                    pb: 4
                  }}
                  data={[
                    // can be only of type LobbyCapacity
                    { value: '2', label: '2', },
                    { value: '4', label: '4' },
                  ]}
                  defaultValue="4"
                  rightSection={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  leftSection={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.6668 17.5V15.8333C16.6668 14.9493 16.3156 14.1014 15.6905 13.4763C15.0654 12.8512 14.2176 12.5 13.3335 12.5H6.66683C5.78277 12.5 4.93493 12.8512 4.30981 13.4763C3.68469 14.1014 3.3335 14.9493 3.3335 15.8333V17.5M13.3335 5.83333C13.3335 7.67428 11.8411 9.16667 10.0002 9.16667C8.15921 9.16667 6.66683 7.67428 6.66683 5.83333C6.66683 3.99238 8.15921 2.5 10.0002 2.5C11.8411 2.5 13.3335 3.99238 13.3335 5.83333Z" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <TheButton onClick={async () => {
                  const capacity = parseInt(selectRef.current?.value ?? '');

                  if (capacity !== 2 && capacity !== 4 && capacity !== 8) {
                    alert.error('Invalid capacity');
                    return;
                  };

                  handleCreateLobby({ capacity })
                    .then(async (reply) => {
                      if (reply) {
                        const { lobbyId } = reply.LobbyCreated;
                        setTimeout(() => navigate(newRoutes.lobby(lobbyId)), 800);
                      }
                      /**
                       * Refetch lobbies after successful promise resolution
                       */
                      await refetchLobbies();
                    })
                    .catch(error => {
                      console.log('Lobby creation cancelled');
                    });



                }}  >
                  Create
                </TheButton>
              </Stack>
            </Stack>
          </Panel>
        </GridColumn>

        {cards.map((card, index) => (
          <GridColumn key={`${index} - ${card.lobbyId}`}>
            <Card
              isFinished={card.isFinished}
              tierText={card.tierText}
              lobbyId={card.lobbyId}
              playersSize={card.playersSize}
              playersJoined={card.playersJoined}
              gasNeeded={card.gasNeeded}
              gasReserved={card.gasReserved}
              onJoin={() => {
                console.log('onJoin');
                handleJoinLobby({ lobbyId: card.lobbyId });
              }}
            />
          </GridColumn>
        ))}
      </Grid>
    </Flex >
  );
};

const SwordsImage = () => <Image maw={105} src={ArenaPng} mb={14} />;
const TitleText = ({ children, ...titleProps }: TitleProps) => <Title order={2} c={'white'} {...titleProps} >{children}</Title>;

const GridColumn = ({ children }) => {
  return (
    <Grid.Col
      span={{
        xs: 12,
        sm: 6,
        md: 4,
      }}
    >
      {children}
    </Grid.Col>
  );
};

const Card = ({
  isFinished,
  tierText,
  lobbyId,
  playersSize,
  playersJoined,
  gasNeeded,
  gasReserved,
  onJoin
}: {
  isFinished?: boolean,
  tierText: string,
  lobbyId: string,
  playersSize: number | string,
  playersJoined: number,
  gasNeeded: number,
  gasReserved: number,
  onJoin: () => void,
}) => {
  return (
    <Panel h={370} pos="relative" >
      {/* Lobby ID - absolutely positioned*/}
      <Box pos="absolute"
        top={10}
        right={10}
      >
        <Text fz={12} fw="600" color="white" bg={"rgba(0, 0, 0, 0.4)"}
          py={4}
          px={8}
          style={{
            borderRadius: 9999,
          }}
        >Lobby ID #{lobbyId}</Text>
      </Box>

      {/* Centered Content */}
      <Stack align="center" h="100%" gap={0}>
        <SwordsImage />

        <TitleText mb="sm">{tierText}</TitleText>

        <Badge c={'white'} style={{ textTransform: 'none' }}>
          {playersJoined} of {playersSize} players
        </Badge>

        <Box
          mt="auto"
          mb="lg"
        >
          {
            isFinished
              ? <Text c="red" fw={600}>Lobby ended</Text>
              : gasNeeded > 0 ? <GasReserved  {...{ gasNeeded, gasReserved }} /> : null
          }
        </Box>

        <TheButton onClick={() => {
          setTimeout(onJoin, 200);
        }} w="100%" >
          Join the Lobby
        </TheButton>

      </Stack>

    </Panel>
  );
};