interface GameplayStats {
    session_id:string,
    challenge_id:string,
    tokens_placed:number
}

export class Singleton
{
    private static instance: Singleton;

    public challengers = {};

    public games : GameplayStats[] = [];

    private constructor(){}

    public static getInstance(): Singleton
    {
        if(!Singleton.instance)
        {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}