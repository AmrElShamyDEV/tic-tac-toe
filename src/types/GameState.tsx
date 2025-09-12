import type { CellValue } from "../components/board";
export interface GameState {
    board : CellValue[] , 
    currentPlayer : "X" | "O",
    winner : string | null , 
    isDraw : boolean,
    scores : {X:number;O:number} ,
    isAgainstAI : boolean
}