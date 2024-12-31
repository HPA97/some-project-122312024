let globalCardIdCounter = 0;

const getNextCardId = (): number => {
    return globalCardIdCounter++;
};


// USER
export type UserType = {
    id: String;
    username: String;
}

export enum CardSuit {
    CLUBS,
    DIAMONDS,
    SPADES,
    HEARTS,
    SPECIAL
}

export type Card = {
    id: number;
    value: number;
    suit: CardSuit;
    isFrontFace: boolean;
    level: number;
}

/*
export const SuitFromValue = (value: number): CardSuit => {
    if(value < 13) return CardSuit.CLUBS;
    if(value < 26) return CardSuit.DIAMONDS;
    if(value < 39) return CardSuit.SPADES;
    if(value < 52) return CardSuit.HEARTS;
    return CardSuit.SPECIAL;    
}
*/



// SESSION/ROOM
export type RoomType = {
    id: Number;
    playerA: UserType;
    playerB: UserType;
    matchState: MatchState;
    finished: Boolean;
}

export type Rules = {
    startingHand: Card[];
    goNextRoundPart: (currentMatchState: MatchState) => MatchState;
}

// GAME LOGIC
export enum RoundState {
    UNKNOWN,
    IS_ROUND_START,
    IS_PLACE_POINTS,
    IS_STEAL_POINTS,
    IS_ROUND_END,
    IS_GAME_OVER
}

export const RoundStateTime = new Map<RoundState, number>([
    [RoundState.IS_ROUND_START, 1500],
    [RoundState.IS_PLACE_POINTS, 6000],
    [RoundState.IS_STEAL_POINTS, 4000],
    [RoundState.IS_ROUND_END, 2000],
    [RoundState.IS_GAME_OVER, 4000],
]);

export type SquareRule = {
    id: Number;
    reward: (value: number) => number;
}

export const BoardSquareRules: SquareRule[] = [
    { id: 0, reward: (value) => value + 1 },
    { id: 1, reward: (value) => value + 2 },
    { id: 2, reward: (value) => value + 3 },
    { id: 3, reward: (value) => value + 5 },
    { id: 4, reward: (value) => value + 7 },
    { id: 5, reward: (value) => value + 13 }
];

export const CreateCard = (value: number, suite: CardSuit, isFrontFace: boolean, level: number): Card => {
    const id = getNextCardId();
    const newCard: Card = { id: id, value: value, suit: suite, isFrontFace: isFrontFace, level: level };
    return newCard;
}

export const GameRules: Rules = {
    startingHand: [
        CreateCard(0, CardSuit.CLUBS, true, 0),
        CreateCard(2, CardSuit.DIAMONDS, true, 1),
        CreateCard(4, CardSuit.SPADES, true, 2),
        CreateCard(10, CardSuit.HEARTS, true, 3),
        CreateCard(11, CardSuit.HEARTS, true, 4)
    ],

    goNextRoundPart: (currentMatchState: MatchState) => {
        const currentRoundState = currentMatchState.roundState;
        const currentRound = currentMatchState.round;
        switch (currentRoundState) {
            case RoundState.IS_ROUND_START: {
                currentMatchState.roundState = RoundState.IS_PLACE_POINTS;
                break;
            }
            case RoundState.IS_PLACE_POINTS: {
                currentMatchState.roundState = RoundState.IS_STEAL_POINTS;
                break;
            }
            case RoundState.IS_STEAL_POINTS: {
                currentMatchState.roundState = RoundState.IS_ROUND_END;
                // TODO Take slot cards back into player hands with slot bonus
                break;
            }
            case RoundState.IS_ROUND_END: {
                currentMatchState.roundState = RoundState.IS_GAME_OVER;
                if (currentRound < 2) {
                    currentMatchState.roundState = RoundState.IS_ROUND_START;
                    currentMatchState.round++;
                }
                break;
            }
            case RoundState.IS_GAME_OVER: {
                // TODO Should this be where the server shuts down the session afer the game over screen is timed out?
                break;
            }
            default: {
                console.error("GameRules: goNextRoundPart: does not recogniz current round state: " + RoundState[currentRoundState]);
                break;
            }
        }
        currentMatchState.roundPartTimerMilliseconds = RoundStateTime.get(currentMatchState.roundState) ?? -1;
        return currentMatchState;
    }
}

export type PlayerHand = {
    cards: Card[];
}

export type MatchState = {
    round: number;
    roundState: RoundState;
    roundPartTimerMilliseconds: number;
    playerAHands: PlayerHand;
    playerBHands: PlayerHand;
    playerABoardSlots: Array<Card | null>; // 6 slots, in order of 0-5
    playerBBoardSlots: Array<Card | null>; // 6 slots, in order of 0-5
    isPlayerA: boolean;
}

// SERVER
export enum ServerResponseMatter {
    NEW_ROOM_SETUP,
    NEXT_ROUND_PART
}

export type ServerResponse = {
    matter: ServerResponseMatter;
    newRoom: RoomType | null;
}

export type CardSlotUpdate = {
    playerId: string;
    roomId: number;
    slotId: number;
    card: Card | null;
}